import React from 'react';
import pick from 'lodash.pick';

let defaultReturnObj = () => {
  return {};
};

export default function ({ fields=[], fieldGroups={}, getValues, getErrors=defaultReturnObj, formatError=defaultReturnObj, toForm = {}, fromForm = {} }) {
  return function (Component) {
    return React.createClass({
      getInitialState() {
        return {
          values: pick(getValues(this.props), fields) || {}
        };
      },

      componentWillReceiveProps(props) {
        let state = {
          values: pick(getValues(props), fields) || {}
        };
        this.setState(state);
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

              this.setState((state) => {
                return {
                  values: {
                    ...state.values,
                    [f]: fromForm[f] ? fromForm[f](value) : value
                  }
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

      buildFieldGroups(errors) {
        return Object.keys(fieldGroups).reduce((obj, fg) => {
          var values = toForm[fg] ? toForm[fg](this.state.values[fg] || []) : this.state.values[fg] || [];

          obj[fg] = {
            fields: values.map((val, i) => {
              return {
                value: val,
                onChange: (e) => {
                  var target = e.currentTarget;
                  var value = target.value;

                  if (target.type === 'checkbox' || target.type === 'radio') {
                    value = target.checked;
                  }

                  var vals = [...(this.state.values[fg] || [])];
                  vals[i] = value;

                  this.setState((state) => {
                    return {
                      values: {
                        ...state.values,
                        [fg]: vals
                      }
                    };
                  });
                }
              };
            }),
            addOne: () => {
              var toAdd = fieldGroups[fg].addOne();
              this.setState((state) => {
                return {
                  values: {
                    ...state.values,
                    [fg]: [...state.values[fg] || [], toAdd]
                  }
                };
              });
            },
            removeOne: (idx) => {
              var vals = [...(this.state.values[fg] || [])];
              vals.splice(idx,1);

              this.setState((state) => {
                return {
                  values: {
                    ...state.values,
                    [fg]: vals
                  }
                }
              })
            }
          };

          return obj;
        }, {});
      },

      render() {
        const errors = getErrors(this.props) || [];
        const fieldProps = this.buildFieldProps(errors);
        const fieldGroupProps = this.buildFieldGroups(errors);
        const hasErrors = Object.keys(errors).length > 0;
        const errorMessage = this.props.errorMessage || (hasErrors && 'Please correct the errors in the form');

        return (
          <Component {...this.props} fields={fieldProps} fieldGroups={fieldGroupProps} errorMessage={errorMessage} onSubmit={this.onSubmit} onChange={this.onChange}/>
        );
      }
    });
  };
}
