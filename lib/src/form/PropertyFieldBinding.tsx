import React, { ComponentType, ReactElement } from "react";
import { FormHelperText } from "@mui/material";

import {
    FastField,
    Field,
    FieldProps as FormikFieldProps,
    getIn
} from "formik";

import {
    CMSType,
    FieldProps,
    PropertyFieldBindingProps,
    ResolvedArrayProperty,
    ResolvedProperty
} from "../types";

import { SelectFieldBinding } from "./field_bindings/SelectFieldBinding";
import {
    ArrayEnumSelectBinding
} from "./field_bindings/ArrayEnumSelectBinding";
import {
    StorageUploadFieldBinding
} from "./field_bindings/StorageUploadFieldBinding";
import { TextFieldBinding } from "./field_bindings/TextFieldBinding";
import { SwitchFieldBinding } from "./field_bindings/SwitchFieldBinding";
import { DateTimeFieldBinding } from "./field_bindings/DateTimeFieldBinding";
import { ReferenceFieldBinding } from "./field_bindings/ReferenceFieldBinding";
import { MapFieldBinding } from "./field_bindings/MapFieldBinding";
import { RepeatFieldBinding } from "./field_bindings/RepeatFieldBinding";
import { BlockFieldBinding } from "./field_bindings/BlockFieldBinding";
import { ReadOnlyFieldBinding } from "./field_bindings/ReadOnlyFieldBinding";
import { MarkdownFieldBinding } from "./field_bindings/MarkdownFieldBinding";
import {
    ArrayOfReferencesFieldBinding
} from "./field_bindings/ArrayOfReferencesFieldBinding";

import { ErrorBoundary, isReadOnly, resolveProperty } from "../core";
import {
    ArrayCustomShapedFieldBinding
} from "./field_bindings/ArrayCustomShapedFieldBinding";

/**
 * This component renders a form field creating the corresponding configuration
 * from a property. For example if bound to a string property, it will generate
 * a text field.
 *
 * You can use it when you are creating a custom field, and need to
 * render additional fields mapped to properties. This is useful if you
 * need to build a complex property mapping, like an array where each index
 * is a different property.
 *
 * Please note that if you build a custom field in a component, the
 * **validation** passed in the property will have no effect. You need to set
 * the validation in the `EntityCollection` definition.
 *
 * @param name You can use nested names such as `address.street` or `friends[2]`
 * @param property
 * @param context
 * @param includeDescription
 * @param underlyingValueHasChanged
 * @param disabled
 * @param tableMode
 * @param partOfArray
 * @param autoFocus
 * @param shouldAlwaysRerender
 * @category Form custom fields
 */
// export const PropertyFieldBinding = React.memo(
export function PropertyFieldBinding<T extends CMSType = CMSType, CustomProps = any, M extends Record<string, any> = Record<string, any>>
({
     propertyKey,
     property,
     context,
     includeDescription,
     underlyingValueHasChanged,
     disabled,
     tableMode,
     partOfArray,
     autoFocus,
     shouldAlwaysRerender
 }: PropertyFieldBindingProps<any, M>): ReactElement<PropertyFieldBindingProps<any, M>> {

    let component: ComponentType<FieldProps> | undefined;
    const resolvedProperty: ResolvedProperty<T> | null = resolveProperty({
        propertyOrBuilder: property,
        values: context.values,
        path: context.path,
        entityId: context.entityId
    });
    if (resolvedProperty === null) {
        return <></>;
    } else if (isReadOnly(resolvedProperty)) {
        component = ReadOnlyFieldBinding;
    } else if (resolvedProperty.Field) {
        component = resolvedProperty.Field;
    } else if (resolvedProperty.dataType === "array") {
        const of = (resolvedProperty as ResolvedArrayProperty).of;
        if (of) {
            if (Array.isArray(of)) {
                component = ArrayCustomShapedFieldBinding;
            } else if ((of.dataType === "string" || of.dataType === "number") && of.enumValues) {
                component = ArrayEnumSelectBinding;
            } else if (of.dataType === "string" && of.storage) {
                component = StorageUploadFieldBinding;
            } else if (of.dataType === "reference") {
                component = ArrayOfReferencesFieldBinding;
            } else {
                component = RepeatFieldBinding;
            }
        }
        const oneOf = (resolvedProperty as ResolvedArrayProperty).oneOf;
        if (oneOf) {
            component = BlockFieldBinding;
        }
        if (!of && !oneOf) {
            throw Error(`You need to specify an 'of' or 'oneOf' prop (or specify a custom field) in your array property ${propertyKey}`);
        }
    } else if (resolvedProperty.dataType === "map") {
        component = MapFieldBinding;
    } else if (resolvedProperty.dataType === "reference") {
        if (!resolvedProperty.path)
            component = ReadOnlyFieldBinding;
        else {
            component = ReferenceFieldBinding;
        }
    } else if (resolvedProperty.dataType === "date") {
        component = DateTimeFieldBinding;
    } else if (resolvedProperty.dataType === "boolean") {
        component = SwitchFieldBinding;
    } else if (resolvedProperty.dataType === "number") {
        if (resolvedProperty.enumValues) {
            component = SelectFieldBinding;
        } else {
            component = TextFieldBinding;
        }
    } else if (resolvedProperty.dataType === "string") {
        if (resolvedProperty.storage) {
            component = StorageUploadFieldBinding;
        } else if (resolvedProperty.markdown) {
            component = MarkdownFieldBinding;
        } else if (resolvedProperty.email || resolvedProperty.url || resolvedProperty.multiline) {
            component = TextFieldBinding;
        } else if (resolvedProperty.enumValues) {
            component = SelectFieldBinding;
        } else {
            component = TextFieldBinding;
        }
    }

    if (component) {

        const componentProps: PropertyFieldBindingProps<T, M> = {
            propertyKey,
            property: resolvedProperty as ResolvedProperty<T>,
            includeDescription,
            underlyingValueHasChanged,
            context,
            disabled,
            tableMode,
            partOfArray,
            autoFocus,
            shouldAlwaysRerender
        };

        // we use the standard Field for user defined fields, since it rebuilds
        // when there are changes in other values, in contrast to FastField
        const FieldComponent = shouldAlwaysRerender || resolvedProperty.Field ? Field : FastField;

        return (
            <FieldComponent
                required={resolvedProperty.validation?.required}
                name={`${propertyKey}`}
            >
                {(fieldProps: FormikFieldProps<T>) => {
                    return <FieldInternal
                        component={component as ComponentType<FieldProps>}
                        componentProps={componentProps}
                        fieldProps={fieldProps}/>;
                }}
            </FieldComponent>
        );

    }

    return (
        <div>{`Currently the field ${resolvedProperty.dataType} is not supported`}</div>
    );
}

// ,
// equal);

function FieldInternal<T extends CMSType, CustomProps, M extends Record<string, any>>
({
     component,
     componentProps: {
         propertyKey,
         property,
         includeDescription,
         underlyingValueHasChanged,
         tableMode,
         partOfArray,
         autoFocus,
         context,
         disabled,
         shouldAlwaysRerender
     },
     fieldProps
 }:
     {
         component: ComponentType<FieldProps>,
         componentProps: PropertyFieldBindingProps<T, M>,
         fieldProps: FormikFieldProps<T>
     }) {

    const customFieldProps: any = property.customProps;
    const value = fieldProps.field.value;
    const initialValue = fieldProps.meta.initialValue;
    const error = getIn(fieldProps.form.errors, propertyKey);
    const touched = getIn(fieldProps.form.touched, propertyKey);

    const showError: boolean = error &&
        (fieldProps.form.submitCount > 0 || property.validation?.unique) &&
        (!Array.isArray(error) || !!error.filter((e: any) => !!e).length);

    const isSubmitting = fieldProps.form.isSubmitting;

    const cmsFieldProps: FieldProps<T, CustomProps, M> = {
        propertyKey,
        value: value as T,
        initialValue,
        setValue: (value: T | null) => {
            fieldProps.form.setFieldTouched(propertyKey, true, false);
            fieldProps.form.setFieldValue(propertyKey, value);
        },
        error,
        touched,
        showError,
        isSubmitting,
        includeDescription: includeDescription ?? true,
        property: property as ResolvedProperty<T>,
        disabled: disabled ?? false,
        underlyingValueHasChanged: underlyingValueHasChanged ?? false,
        tableMode: tableMode ?? false,
        partOfArray: partOfArray ?? false,
        autoFocus: autoFocus ?? false,
        customProps: customFieldProps,
        context,
        shouldAlwaysRerender: shouldAlwaysRerender ?? true
    };

    return (
        <ErrorBoundary>

            {React.createElement(component, cmsFieldProps)}

            {underlyingValueHasChanged && !isSubmitting &&
                <FormHelperText>
                    This value has been updated elsewhere
                </FormHelperText>}

        </ErrorBoundary>);

}
