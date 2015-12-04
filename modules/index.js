import React from 'react';
import pick from 'lodash.pick';

let defaultReturnObj = () => {
  return {};
};

export default function ({ fields, getValues, getErrors=defaultReturnObj, formatError=defaultReturnObj, toForm = {}, fromForm = {} }) {
  return function (Component) {
    return React.createClass({
      getInitialState() {
        return {
          values: pick(getValues(this.props), fields) || {}
        };
      },

      onSubmit(e) {
        e.preventDefault();
        this.props.onSubmit({ ...this.state.values });
      },

      triggerChange() {
        if (this.props.onChange) {
          this.props.onChange({
            currentTarget: {
              value: { ...this.state.values }
            }
          });
        }
      },

      buildFieldProps(errors) {

        return fields.reduce((obj, f) => {
          obj[f] = {
            name: f,
            value: toForm[f] ? toForm[f](this.state.values[f]) : this.state.values[f],
            error: errors[f] ? formatError(f, errors[f]) : null,
            onChange: (e) => {

              var target = e.currentTarget;
              var value = target.value;

              if (target.type === 'checkbox' || target.type === 'radio') {
                value = target.checked;
              }

              this.setState({
                values: {
                  ...this.state.values,
                  [f]: fromForm[f] ? fromForm[f](value) : value
                }
              }, () => this.triggerChange());
            }
          };

          if (typeof obj[f].value === 'boolean') {
            obj[f].checked = obj[f].value;
          }

          return obj;
        }, {});
      },

      render() {
        const errors = getErrors(this.props) || [];
        const fieldProps = this.buildFieldProps(errors);
        const hasErrors = Object.keys(errors).length > 0;
        const errorMessage = this.props.errorMessage || (hasErrors && 'Please correct the errors in the form');

        return (
          <Component {...this.props} fields={fieldProps} errorMessage={errorMessage} onSubmit={this.onSubmit} onChange={this.onChange}/>
        );
      }
    });
  };
}
