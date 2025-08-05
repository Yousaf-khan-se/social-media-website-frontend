import * as React from "react"
import { Controller } from "react-hook-form";

const FormFieldContext = React.createContext({})
const FormItemContext = React.createContext({})

export const FormField = (
    {
        ...props
    }
) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
}

export { FormFieldContext, FormItemContext } 