### Context

There are a lot of outdated files, descriptions, summaries, etc. Please try to focus on the files I explicitly mention that contain the most up to date information.

../appApiFiles/* - This whole directory contains the most up to date typescript I'm looking to change
manual-review.md - This contains my manually written description of the problem and what I'm trying to solve
conditionalrequired.bluestep - This contains some of the business rules I'm trying to represent
mardetail.bluestep - This contains more business rules I'm trying to represent
marformgraphqlresults.json - This is a list of fields on the MAR form to reference. Not all of them are required here.
temp_output.json - These are the current results that are produced
../contextv3.md - Context on BlueStep that may be applicable

### Problem

I've iterated through a number of changes to get to the point I'm at. I think the current implementation is capable of representing what I need, but I'm not happy with how complex it's become. I'd like to use it as reference for what I'm generally trying to accomplish, but I'd like to start fresh with a less complex implementation.

As a reminder, these are the main considerations I need to solve
* Provide a definition that can be read by an App to instruct it on how to capture user data
* A list of fields and their properties need to be included
* Dynamic Required Field rules (static rules can be included on the field if that's the best solution)
* Dynamic Hide/Show rules
* Static Option Values
* Dynamic Option Values - I'm open to other ideas, but the applicable options are currently included in the individual entries GET call. So there needs to be a way to indicate these are dynamic and where to find them
* If a field is editable or not


Also keep in mind the MAR schema is just one of many forms I need to do this to. It just happens to be the most complex. Be sure to make everything Generic so it can be applied elsewhere.


### Instructions
Please dont make any changes to existing files in ../appApiFiles/*. Rather create new files in that directory to represent changes. Prefix them with `new-`. Simplicity is key here.

Create 5-13-25-AI-Notes.md to track any relevant information needed to continue in a new session.