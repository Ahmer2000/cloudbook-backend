const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Notes  = require('../models/Notes')
const { body, validationResult } = require('express-validator');

//Get all notes of an user with get request:"/api/notes/fetchAllNotes" -- LOGIN REQUIRED -- ROUTE 1
router.get('/fetchAllNotes',fetchuser,async (req,res)=>{
    try {
        const notes = await Notes.find({user:req.user.id})
        res.send(notes)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal server error')
    }
})

//Add a note of an user with post request:"/api/notes/addNote" -- LOGIN REQUIRED -- ROUTE 2
router.post('/addNote',fetchuser,[
    body('title', 'Enter a title'),
    body('description', "Enter a description").isLength({ min: 5 })
],async (req,res)=>{
    
    try {
        const{title,description,tag} = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Notes({title,description,tag,user:req.user.id});
        const savedNote = await note.save();
        res.send(savedNote)
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal server error')
    }
})

//Update a note of an user with put request:"/api/notes/updateNote/:id" -- LOGIN REQUIRED -- ROUTE 3
router.put('/updateNote/:id',fetchuser,async (req,res)=>{
    const {title,description,tag} = req.body;
    //create a new note object
    const newNote = {};
    if (title) {
        newNote.title = title
    }
    if (description) {
        newNote.description = description
    }
    if (tag) {
        newNote.tag = tag
    }
    //Find the note to be updated and update it
    let note = await Notes.findById(req.params.id)
    if(!note){
        return res.status(404).send("Not Found")
    }
    else if (note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed")
    }
    note = await Notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
    res.send({note})

})

//Delete a note of an user with delete request:"/api/notes/deleteNote/:id" -- LOGIN REQUIRED -- ROUTE 4
router.delete('/deleteNote/:id',fetchuser,async (req,res)=>{
    
    //Find the note to be deleted and delete it
    let note = await Notes.findById(req.params.id)
    if(!note){
        return res.status(404).send("Not Found")
    }
    else if (note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed")
    }
    note = await Notes.findByIdAndDelete(req.params.id)
    res.send({"success":"Note has been deleted"})

})

module.exports = router;