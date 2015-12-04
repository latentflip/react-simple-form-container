import React from 'react';
import ReactDOM from 'react-dom';
import connectForm from '../modules/index';

let FormGroup = React.createClass({
  render() {
    let { onChange, fields } = this.props;

    return (
      <fieldset>
        <legend>Some group</legend>
        <input type='text' {...fields.subThing1}/>
        <input type='text' {...fields.subThing2}/>
      </fieldset>
    );
  }
});

let FormGroupConnected = connectForm({
  fields: ['subThing1', 'subThing2'],
  getValues(props) {
    return props.value;
  }
})(FormGroup);

let Form = React.createClass({
  render() {
    let { onSubmit, fields } = this.props;

    return (
      <form onSubmit={onSubmit}>
        <input type='text' {...fields.aTextfield}/>
        <input type='checkbox' {...fields.aCheckbox} />

        <select {...fields.aSelect}>
          <option>Please choose</option>
          <option value='id-1'>Option 1</option>
          <option value='id-2'>Option 2</option>
          <option value='id-3'>Option 3</option>
        </select>

        <FormGroupConnected {...fields.subObject} />

        <button type='submit'>Submit</button>
      </form>
    );
  }
});

let ConnectedForm = connectForm({
  fields: [
    'aTextfield', 'aCheckbox', 'aSelect', 'subObject'
  ],
  getValues(props) {
    return props.value;
  }
})(Form);

let App = React.createClass({
  handleSubmit(form, data) {
    console.log('Submit:', form, data);
  },

  render() {
    let initialData1 = {
      aTextfield: 'foo',
      aCheckbox: false,
      aSelect: 'id-2',
      subObject: {
        subThing1: 'sub-value-1',
        subThing2: 'sub-value-2'
      }
    };

    let initialData2 = {
      aTextfield: 'bar',
      aCheckbox: true,
      aSelect: null
    };

    return (
      <div>
        <h1>Form 1</h1>
        <h2>Data:</h2>
        <pre>{JSON.stringify(initialData1)}</pre>
        <ConnectedForm onSubmit={this.handleSubmit.bind(this, 'form1')} value={initialData1} />

        <h1>Form 2</h1>
        <h2>Data:</h2>
        <pre>{JSON.stringify(initialData2)}</pre>
        <ConnectedForm onSubmit={this.handleSubmit.bind(this, 'form2')} value={initialData2} />
      </div>
    );
  }
});

ReactDOM.render(<App />, document.querySelector('#root'));
