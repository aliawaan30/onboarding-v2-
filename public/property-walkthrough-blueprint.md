---
name: property-walkthrough-blueprint
description: The complete blueprint of the Property Walkthrough app, the seven-step student wizard that turns real estate listing photos into one sellable AI video walkthrough. Read this before building or changing anything in that app, and follow it exactly, piece by piece.
---

# Property Walkthrough, the full blueprint

## Rules

1. Never build the whole app in one go. Build only the piece the user names. If the user says "build the app", ask which piece, or start at Piece 1 and stop.
2. If a request conflicts with this blueprint, follow the blueprint and say so plainly.
3. These things belong to the student. Nothing automatic may ever overwrite them: their photo order, their location labels (including custom labels typed via Other), their camera movement choices, their movement guidance text, their quality-control verdicts (Approved, Retry, Flagged), their uploaded clip files, their final video URL, and their listing details.
4. Never create records during a build. No sample data, no test listings, no demo photos. The shape only. The app is finished when a student creates their own real listing.
5. Never delete a photo or listing outright. Archival only, as described below.

## What this app is

A Base44 app a student uses to run a property walkthrough video service. The student uploads a real estate agent's listing photos, orders them, labels them, and the app generates one Envato-ready Kling 3.0 prompt per photo pair. The student generates the clips on Envato's website, uploads them back, quality-controls them, and finishes one final stitched walkthrough video to sell to the agent. The video generation itself happens outside the app. The app is the factory desk: ordering, labeling, prompt generation, quality control, and delivery.

## The pieces, in build order

### Piece 1. The Listing entity

One listing is one property, one job. Fields:

- address (string, the full address)
- agent_name (string)
- agent_phone (string)
- agent_agency (string)
- price (string, like "$850,000")
- description (string, the listing's selling points)
- bedrooms (number)
- bathrooms (number)
- car_spaces (number)
- notes (string, the student's own notes)
- status (string, a stage label, not a workflow gate. Exactly these values, in this order: Images Pending, Images Uploaded, Prompts Ready, Stitched. Default: Images Pending)
- final_video_url (string, empty until the finished video exists)
- order_confirmed (boolean, default false. True once the student confirms the photo route)

Auto-flip rules, the app sets these, never the student:
- First photo uploaded on a listing: status becomes Images Uploaded.
- Every scene on the listing has a generated prompt: status becomes Prompts Ready.
- final_video_url gets a value: status becomes Stitched.

Edge cases:
- Status only moves forward. A student relabeling photos after confirm must not drop the status back to Images Pending. Order changes are handled by the stale system in Piece 6, not by status.
- Do not add statuses like Delivered, Called or Yes. This app is the video factory, not the lead CRM.

### Piece 2. The ListingPhoto entity

One photo in the walking order. Fields:

- listing_id (reference to Listing)
- image_url (string, the hosted photo file)
- source_filename (string, the original filename the student uploaded, kept exactly as uploaded)
- sequence_order (number, 1-based position in the walk)
- location (string, the student's room label, like "Kitchen". Empty until labeled)
- next_instruction (string, OPTIONAL. The student's extra movement guidance for the transition that starts at this photo, like "Move through the sliding doors toward the outdoor area". Blank is normal and fine)
- archived (boolean, default false. The only form of deletion. When a photo is archived: archived = true and sequence_order = 0, and the remaining photos renumber so there are no gaps)

Edge cases:
- Never hard-delete a photo. The archive button is the only remove action anywhere in the app.
- A photo with sequence_order 0 or archived true is invisible to the route, the confirm logic and the breadcrumb. This is the rule that prevents the archived-photo bug described in Piece 7.
- Uploaded photos auto-number to the end of the current order.

### Piece 3. The Transition entity

One transition is one video scene: the move from photo N to photo N+1. N photos in order make N minus 1 transitions. Fields:

- listing_id (reference to Listing)
- sequence_order (number, 1-based, matches the pair's position in the walk)
- start_photo (reference to ListingPhoto, anchored by ID, never by position)
- end_photo (reference to ListingPhoto, anchored by ID)
- start_location (string, copied from the start photo's location at confirm time)
- end_location (string, copied from the end photo's location at confirm time)
- student_instruction (string, copied from the start photo's next_instruction at confirm time. May be blank)
- camera_movement (string, one of exactly these 8 options, default "Push forward": Push forward, Move through doorway, Move down hallway, Turn around corner, Reveal adjoining room, Move outside, Pull back, Clean cut)
- generated_prompt (string, the Envato-ready prompt, built by Piece 5)
- clip_filename (string, canonical, built at confirm time: two-digit sequence number, then start location, then "to", then end location, lowercase, underscores, no spaces, like 01_front_facade_to_entrance.mp4)
- result_video_url (string, empty until the student uploads the finished clip for this scene)
- qc_status (string enum: Pending, Accepted, Retry, Flagged. Default Pending)
- is_stale (boolean, default false. True means the photo order changed after confirm and this scene must be re-confirmed)

Edge cases:
- Locations are copied at confirm time, not live-linked. If the student edits a photo label after confirm, the fix is: mark scenes stale, re-confirm. Same route, fresh copies.
- Rebuilding transitions deletes and recreates them, which wipes generated prompts on purpose. The student re-runs prompt generation after re-confirming. That is the intended cost of reordering, and the stale badge warns them first.
- The UI must hide these words: Transition, ListingPhoto, sequence_order, qc_status, is_stale, archived. Plain language everywhere, see Piece 14.

### Piece 4. The app shell

The frame everything else mounts into.

- A listings dashboard: one card per listing with the address and its status. A "New Listing" button. Clicking a card opens that listing's wizard. Empty state: one line, "Add your first listing."
- A new-listing form: address, agent name, phone, agency, price, bedrooms, bathrooms, car spaces, description. Creates the listing at status Images Pending and opens its wizard.
- Inside a listing, a seven-step wizard with a visible progress bar across the top, seven ticks in this order: Photos, Order, Labels, Route, Envato, Clips, Finished. The current step is highlighted. Completed ticks are filled.
- Progress saves after every action. Reloading the page returns the student to their listing in the state they left it.
- Steps that are not ready yet show why in one plain sentence, like "Upload photos to start." They never show a dead button without a reason.

### Piece 5. Step 1, Upload photos

- Multiple photo upload at once. Large thumbnails immediately. Original filenames saved to source_filename.
- Photos append to the end of the order. First photo flips the listing to Images Uploaded.
- Each photo can be archived from this step too (the archive rule from Piece 2, same behavior everywhere).
- Do not auto-label, auto-describe, or auto-detect anything. No AI looks at these photos. This was tried and removed. The student is the only source of truth for what a photo shows.

### Piece 6. Step 2, Put photos in walking order

- Large drag-and-drop cards with obvious drag handles. Works on desktop pointer and touch. Move-left and move-right buttons on every card as the fallback.
- Cards display big position numbers: 01, 02, 03.
- One instruction line at the top: "Put these in the order a buyer would walk through the property."
- Reordering renumbers with no gaps, 1-based.
- If order_confirmed is true and the student reorders: every scene on the listing is marked stale (is_stale = true, prompts preserved not wiped), and the wizard requires the route to be re-confirmed before Envato generation and clip upload count as valid. A plain-language notice explains this: "You changed the order. Review and confirm the route again."
- No database words on screen. Never show sequence_order or stale.

### Piece 7. Step 3, Label each image

- Every photo gets quick-pick chips, exactly these, in this order: Exterior, Front door, Entry, Living room, Kitchen, Dining room, Bedroom, Bathroom, Balcony, Hallway, Other.
- Selecting Other immediately shows a required text field: "What is this room or area?" The typed value becomes the photo's location, and it is kept as typed. Chips never rewrite a custom label.
- The student can change any label any time by tapping another chip. Their choice is never auto-changed by anything.
- Every visible photo must have a location before the student can move to Step 4. If any are blank, Step 4 shows inline: which photo number, which photo, "Label this photo to continue." No modal errors, no silent blocking.
- CRITICAL edge case, this exact bug shipped once: validation must only check NON-ARCHIVED photos. An archived photo with sequence_order 0 and no location must never block confirming the route. If confirm ever fails with a missing-fields error while every visible photo is labeled, this is the bug, and the fix is filtering archived photos out of validation.

### Piece 8. Step 4, Review the route, and the confirm function

The confirm action is a backend function. Build it exactly like this.

Function: createTransitionsForListing. Input: listing_id.
Behavior:
1. Read all photos where archived is false, ordered by sequence_order.
2. If fewer than two photos: fail with "Add at least two photos first."
3. If any of those photos has an empty location: fail with a clear error that names the photo's position and ID, like "Missing location on photo 4". Nothing is built on a failed confirm.
4. Delete the listing's existing transitions and rebuild them: one per consecutive pair, anchored start_photo and end_photo by ID, copying locations and the start photo's next_instruction into student_instruction, setting camera_movement to Push forward, building the canonical clip_filename, is_stale false, qc_status Pending.
5. Set the listing's order_confirmed to true. Return success and the scene count.

The Step 4 screen shows:
- A breadcrumb of the route, like: Exterior, Front door, Entry, Living room, Kitchen.
- Each scene as start image, then an arrow, then end image.
- The movement dropdown on each scene, the 8 options from Piece 3, default Push forward. The student changes movement only when needed.
- An optional "Add movement guidance" text field per scene, saved into the start photo's next_instruction.
- A Confirm route button that calls the function. On success the student moves to Step 5. On failure, the inline missing-photo message from Piece 7 shows. Never a modal, never a silent nothing.

Edge case: re-confirm after reorder keeps the same photos but rebuilds the scenes fresh, so renumbered pairs get correct filenames. Confirming twice in a row without changes is harmless.

### Piece 9. Step 5, the Envato pack, and the prompt function

The prompt generation is a backend function. Deterministic. No AI, no vision, no credits, instant. Build it exactly like this.

Function: generatePromptsForListing. Input: listing_id.
Behavior: for each transition in sequence order, build generated_prompt from this exact template, filling the bracketed parts:

"[Movement option]. Camera rigidly locked on professional tripod, no walking bounce, no vertical bobbing, no micro-jitter, gimbal-smooth only, constant linear speed. In one continuous motion, the camera [movement verb phrase] from [start_location] to [end_location]. [Student instruction, if not blank]. Preserve the fixed structure of both frames. Maintain fixed spatial geometry, rigid walls and furniture, no warping, no distortion, no perspective stretch."

- The movement verb phrase comes from the chosen camera_movement option, phrased as a camera action, like "pushes forward" or "moves down the hallway".
- The student_instruction sentence is included only if the field is not blank. If blank, drop that sentence entirely, no double spaces left behind.
- The anti-bounce language is the point of the template. AI video models add human-operator bobbing by default, and it makes the videos unsellable. Never shorten or reword the template.
- When every scene has a prompt, the listing flips to Prompts Ready.
- If a scene is stale, refuse with "Confirm the route first." No prompts for a stale route.

The Step 5 screen shows one card per scene, in order:
- Header like "Scene 1. Exterior to Front door".
- The two photos side by side.
- The generated prompt with a Copy button.
- A Download image pair button (start and end photo files).
- A Download scene card button (the two images and the prompt together).
- An Open Envato button (opens the Envato AI Video Generator in a new tab).
- A Download .txt button at the top that exports every scene's filename and prompt in route order, one file for the whole pack.

### Piece 10. Step 6, Upload clips and quality control

- One upload slot per scene card, labeled with the canonical filename beside it, like "01_exterior_to_front_door.mp4", so the student can name their Envato download to match.
- Uploaded clips save into result_video_url on that scene.
- Quality control buttons on each scene, in plain language: Not started (Pending), Ready to review (Pending with a clip uploaded), Needs another attempt (Retry), Approved (Accepted), and Something is wrong with this scene (Flagged), for a scene that regenerating will not fix and that needs the route or the photos changing. All four stored values must be reachable from the screen, because Safeguard 9 checks for them.
- A scene cannot be Approved without an uploaded clip.
- One retry rule: a scene marked Retry can be re-generated once on Envato before the student should reconsider the route itself. The app just tracks the verdict, the generation happens on Envato.
- Progress line: "X of Y clips approved".
- Never show qc_status or any database word.

### Piece 11. Step 7, Finish the video

- The finish step stays locked until every scene has an uploaded clip AND is Approved. Locked state shows why: "Approve every scene to unlock."
- The stitch itself happens OUTSIDE the app, by design. The student downloads the approved clips and joins them with ffmpeg (or their Superagent's video-stitcher skill), then uploads or pastes the final video. Do not build a server-side stitch function. This is a deliberate design choice: Base44 backend functions are for data, not video rendering.
- Unlocked state gives the student: a copy-paste handoff message listing the approved clips in route order for their Superagent to stitch, and a final video URL field plus file upload for the finished video, saved to the listing's final_video_url.
- Saving the final video URL flips the listing to Stitched and shows the success state exactly: "Your walkthrough is ready.", with a video player and a Download button.
- Nothing in Steps 1 to 6 is locked after finishing. The student can still archive photos or fix labels, and the stale system handles it.

### Piece 12. The stale system, the third function

Function: markStaleTransitions. Input: listing_id. Behavior: sets is_stale true on every scene of that listing, preserving generated prompts, clips and QC verdicts. Called automatically whenever the photo order changes while order_confirmed is true. Archiving a photo counts as an order change, because archiving renumbers the remaining photos, so it marks scenes stale too. Adding a new photo to a confirmed listing counts as well.

- Stale scenes show a plain badge: "Order changed. Review and confirm the route again." and the Confirm route button returns to Step 4.
- Stale scenes cannot be prompt-generated (Piece 9 refuses) and their Approved state no longer unlocks Step 7 until re-confirmed. Re-confirming rebuilds scenes, which wipes prompts and clip attachments by design. The student knows the cost before they reorder, because the badge tells them first.
- Never let a reorder silently change scene pairs without a re-confirm. Silent data changes are the one thing this app must never do.

### Piece 13. Safeguards audit, the wiring pass

Verify the whole app enforces all of these, in one pass, without creating any records:
1. Nothing generates before the route is confirmed.
2. Reorder after confirm marks scenes stale, never silent.
3. Archival only, no hard deletes anywhere, archived photos leave the route and never block validation.
4. Scenes anchor to photo IDs, never positions.
5. No AI room detection, no AI route inference, anywhere. If AI is ever added back, it must be student-confirmed, never blocking, never automatic.
6. Confirm requires every visible photo labeled.
7. Finish unlocks only when every scene has a clip and is Approved.
8. Filenames canonical and predictable.
9. QC statuses exactly: Pending, Accepted, Retry, Flagged, in plain language on screen.
10. Progress saves after every action, and the seven-tick progress bar always matches the real state.
11. Statuses auto-flip forward only, and only the three rules in Piece 1 do it.
Fix anything that fails, then report which safeguard numbers passed.

### Piece 14. The plain-language sweep

- Every screen says what it means: Photos, Order, Labels, Route, Envato, Clips, Finished.
- No database words visible anywhere: no Transition, no ListingPhoto, no sequence_order, no stale, no qc_status, no archived, no order_confirmed. The student sees "scenes", "photos", "order", "Approved".
- Buttons are verbs: Upload photos, Confirm route, Copy prompt, Approve, Finish video.
- Every error says what to do next, never just what went wrong.
