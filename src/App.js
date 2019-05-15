import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react/dist/Auth';
import { isTemplateElement } from '@babel/types';

class App extends Component {

    state = {
        notes: [{
            id: 1,
            note: "Hello world",

        }]
    }
    render() {
        const { notes }  = this.state;

        return (
            <div className="flex flex-column items-center justify-center
            bg-washed-red">
            <h1 className="code f2-l">Amplify Notetaker</h1>
            {/* Note Form */}             
            <div className="mb3">
            <input 
                type="text" 
                className="pa2 f4"
                placeholer="Write yr note"
                />
            <button className="pa2 f4" type="submit">Add Note</button>
            {/* notes list */}
                {notes.map(item => (
                    <div key={item.id}
                        className="flex items-center">
                        <li className="list pa1 f3">{item.note}</li>
                        <button className="bg-transparent bn f4">
                        
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