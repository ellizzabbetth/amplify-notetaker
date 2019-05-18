import React, { Component } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react/dist/Auth';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from  './graphql/queries';
import { onCreateNote, onDeleteNote, onUpdateNote } from './graphql/subscriptions';


class App extends Component {

    state = {
        id: "",
        note:  "",
        notes: []  // array we are mapping over
    }

    // 
    componentDidMount() {
      this.getNotes();
      // call onCreateNote listener. Execute our subscription when our component mounts
      // unload subscription when component unmounts
      this.createNoteListener = API.graphql(
          graphqlOperation(onCreateNote)
          ).subscribe({
          next: noteData => {
              const newNote = noteData.value.data.onCreateNote;
              const prevNotes = this.state.notes.filter(note => note.id !== newNote.id);
              const updatedNotes = [...prevNotes, newNote]; // add newNote at the end of the array
              this.setState({ notes: updatedNotes });
            
          }
      });
      this.deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe(
          {  // like handleDeleteNote
              next: noteData => {
                  const deletedNote = noteData.value.data.onDeleteNote;
                  const updateNotes = this.state.notes.filter(note => note.id !== 
                    deletedNote.id)
                    this.setState({ notes: updateNotes });
              }
          }
      )
      this.updateNoteListener = API.graphql(graphqlOperation(onUpdateNote)).subscribe(
          {
              next: noteData => {
                  const { notes } = this.state;
                  const updatedNote = noteData.value.data.onUpdateNote;
                  const index = notes.findIndex(note => note.id === updateNote.id);
                  
                  // create new array with 3 parts: 
                  // 1. the part of the array up until the updated note
                  // 2. note array
                  // 3. part after the updated note
                  const updatedNotes = [
                      ...notes.slice(0, index),
                      updatedNote,
                      ...notes.slice(index + 1)
                  ]
                  this.setState({ notes: updatedNotes, note: "", id: ""})
              }
          }
      )
    }

    componentWillUnmount(){
        this.createNoteListener.unsubscribe();
        this.deleteNoteListener.unsubscribe();
        this.updateNoteListener.unsubscribe();
    }

    getNotes = async () => {
        const result = await API.graphql(graphqlOperation(listNotes));
        this.setState({ notes: result.data.listNotes.items });
    }
    /* destructure item */
    handleSetNote = ({ note, id }) => this.setState({ note, id });

    /* takes noteId as an argument */
    handleDeleteNote = async noteId => {
        // get notes from state
        const { notes } = this.state;
        const input = { id: noteId };
        // get results from deleteNote mutation
        //const result = 
        await API.graphql(graphqlOperation(deleteNote, { input }));
        // graph reference to deleted note
        //const deletedNoteId = result.data.deleteNote.id;
        // used deletedNoteId to filter out deletedNote from notes in state
        //const updatedNotes = notes.filter(notes => notes.id !== deletedNoteId);
        // update state
        //this.setState({ notes: updatedNotes });
    }

    hasExistingNote = () => {
        const { notes, id } = this.state;
        if(id) {
            // is the id a valid id
            // is id = to any id we have in state
            // compare with -1 to return boolean
            const isNote = notes.findIndex(note => note.id === id) > -1;
            return isNote;
        }
        return false; // create note
    }

    // update note value in state,         // get's event object from change  event
    handleChangeNote = event => this.setState({ note: event.target.value})


  
    handleAddNote = async event => {
        // get note from state by destructuring
        const { note, notes } = this.state;
        // prevent reloading the page
        event.preventDefault();
        // check if we have an existing note, if so update it
        if(this.hasExistingNote()){
            
            this.handleUpdateNote();
        } else {
            const input = {   note  };
            // execute create note       
            const result = await API.graphql(graphqlOperation(createNote, {input: input}));
            //const newNote = result.data.createNote;
            // add newNote to the notes array
            //const updatedNotes = [newNote, ...notes];
            //this.setState({ notes: updatedNotes, note: ""});
            this.setState({ note: "" });
        }
    };
    
    handleUpdateNote = async () => {
        const {notes, id, note} = this.state;
        const input = { id, note };
        const result = await API.graphql(graphqlOperation(updateNote, {input}));
        const updatedNote = result.data.updateNote;
        // put updated note in appropriate place in list 
        // const index = notes.findIndex(note => note.id === updatedNote.id);
        // // create new array with 3 parts: 
        // // 1. the part of the array up until the updated note
        // // 2. note array
        // // 3. part after the updated note
        // const updatedNotes = [
        //     ...notes.slice(0, index),
        //     updatedNote,
        //     ...notes.slice(index + 1)
        // ]
        // this.setState({ notes: updatedNotes, note: "", id: ""})
    }

    render() {
        const { id, note, notes }  = this.state;

        return (
            <div className="flex flex-column items-center justify-center
            bg-washed-red">
            <h1 className="code f2-l">Amplify Notetaker</h1>
            {/* Note Form */}             
            <form onSubmit={this.handleAddNote} className="mb3">
                <input 
                    type="text" 
                    className="pa2 f4"
                    placeholer="Write yr note"
                    onChange={this.handleChangeNote}
                    value = {note}
                />
                  <button className="pa2 f4" type="submit">{id ? "Update Note" : "Add Note"}</button>
            </form>
          
            {/* notes list */}
            { /* write handDeleteNote as an inline arrow function to prevent it from running on page load*/}
            <div>
                {notes.map(item => (
                    <div key={item.id}
                        className="flex items-center">
                        <li onClick = {() => this.handleSetNote(item)} className="list pa1 f3">{item.note}</li>
  
                        <button onClick = {() => this.handleDeleteNote(item.id)} className="bg-transparent bn f4">
                        
                        <span>&times;</span>
                        </button>
                    </div>
            ))}
            </div>
            </div>
        );
    }
}

export default withAuthenticator(App, { includeGreetings: true});