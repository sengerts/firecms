import React, { createElement } from "react";
import {
    ArrayProperty,
    BooleanProperty,
    CMSType,
    MapProperty,
    NumberProperty,
    PreviewComponentProps,
    ReferenceProperty,
    StringProperty,
    TimestampProperty
} from "../models";

import { ArrayPreview } from "./components/ArrayPreview";
import { ArrayOfMapsPreview } from "./components/ArrayOfMapsPreview";
import { ArrayOfStorageComponentsPreview } from "./components/ArrayOfStorageComponentsPreview";
import { ArrayOfStringsPreview } from "./components/ArrayOfStringsPreview";
import { ArrayPropertyEnumPreview } from "./components/ArrayEnumPreview";
import {
    ArrayOfReferencesPreview,
    default as ReferencePreview
} from "./components/ReferencePreview";
import { BooleanPreview } from "./components/BooleanPreview";
import { EmptyValue } from "./components/EmptyValue";
import { NumberPreview } from "./components/NumberPreview";
import { StringPreview } from "./components/StringPreview";
import { TimestampPreview } from "./components/TimestampPreview";
import { UrlComponentPreview } from "./components/UrlComponentPreview";
import { StorageThumbnail } from "./components/StorageThumbnail";
import { MapPreview } from "./components/MapPreview";

import ReactMarkdown from "react-markdown";
import firebase from "firebase/app";
import { ErrorView } from "../core/components";


export function PreviewComponent<T extends CMSType>(props: PreviewComponentProps<T>) {
    let content: JSX.Element | any;
    const {
        property, name, value, size, height, width
    } = props;

    const fieldProps = { ...props };

    if (value === undefined) {
        content = <EmptyValue/>;
    } else if (property.config?.preview) {
        content = createElement(property.config.preview as React.ComponentType<PreviewComponentProps>,
            {
                name,
                value,
                property,
                size,
                height,
                width,
                customProps: property.config.customProps
            });
    } else if (value === null) {
        content = <EmptyValue/>;
    } else if (property.dataType === "string") {
        const stringProperty = property as StringProperty;
        if (typeof value === "string") {
            if (stringProperty.config?.url) {
                content = <UrlComponentPreview {...fieldProps}
                                               property={property as StringProperty}
                                               value={value}/>;
            } else if (stringProperty.config?.storageMeta) {
                content = <StorageThumbnail {...fieldProps}
                                            property={property as StringProperty}
                                            value={value}/>;
            } else if (stringProperty.config?.markdown) {
                content = <ReactMarkdown>{value}</ReactMarkdown>;
            } else {
                content = <StringPreview {...fieldProps}
                                         property={property as StringProperty}
                                         value={value}/>;
            }
        } else {
            content = buildWrongValueType(name, property.dataType, value);
        }
    } else if (property.dataType === "array") {
        if (value instanceof Array) {
            const arrayProperty = property as ArrayProperty;
            if (!arrayProperty.of) {
                throw Error(`You need to specify an 'of' prop (or specify a custom field) in your array property ${name}`);
            }

            if (arrayProperty.of.dataType === "map") {
                content =
                    <ArrayOfMapsPreview name={name}
                                        property={property as ArrayProperty}
                                        value={value as object[]}
                                        size={size}
                    />;
            } else if (arrayProperty.of.dataType === "reference") {
                content = <ArrayOfReferencesPreview {...fieldProps}
                                                    value={value}
                                                    property={property as ArrayProperty}/>;
            } else if (arrayProperty.of.dataType === "string") {
                if (arrayProperty.of.config?.enumValues) {
                    content = <ArrayPropertyEnumPreview
                        {...fieldProps}
                        value={value as string[]}
                        property={property as ArrayProperty}/>;
                } else if (arrayProperty.of.config?.storageMeta) {
                    content = <ArrayOfStorageComponentsPreview
                        {...fieldProps}
                        value={value}
                        property={property as ArrayProperty}/>;
                } else {
                    content = <ArrayOfStringsPreview
                        {...fieldProps}
                        value={value as string[]}
                        property={property as ArrayProperty}/>;
                }
            } else {
                content = <ArrayPreview {...fieldProps}
                                        value={value}
                                        property={property as ArrayProperty}/>;
            }
        } else {
            content = buildWrongValueType(name, property.dataType, value);
        }
    } else if (property.dataType === "map") {
        if (typeof value === "object") {
            content =
                <MapPreview {...fieldProps}
                            property={property as MapProperty}/>;
        } else {
            content = buildWrongValueType(name, property.dataType, value);
        }
    } else if (property.dataType === "timestamp") {
        if (value instanceof Date) {
            content = <TimestampPreview {...fieldProps}
                                        value={value}
                                        property={property as TimestampProperty}/>;
        } else {
            content = buildWrongValueType(name, property.dataType, value);
        }
    } else if (property.dataType === "reference") {
        if (value instanceof firebase.firestore.DocumentReference) {
            content = <ReferencePreview
                {...fieldProps}
                value={value}
                property={property as ReferenceProperty}
            />;
        } else {
            content = buildWrongValueType(name, property.dataType, value);
        }
    } else if (property.dataType === "boolean") {
        if (typeof value === "boolean") {
            content = <BooleanPreview {...fieldProps}
                                      value={value}
                                      property={property as BooleanProperty}/>;
        } else {
            content = buildWrongValueType(name, property.dataType, value);
        }
    } else if (property.dataType === "number") {
        if (typeof value === "number") {
            content = <NumberPreview {...fieldProps}
                                     value={value}
                                     property={property as NumberProperty}/>;
        } else {
            content = buildWrongValueType(name, property.dataType, value);
        }
    } else {
        content = JSON.stringify(value);
    }

    return content === undefined || content === null ? <EmptyValue/> : content;
}

function buildWrongValueType(name: string | undefined, dataType: string, value: any) {
    console.error(`Unexpected value for property ${name}, of type ${dataType}`, value);
    return (
        <ErrorView error={`Unexpected value: ${JSON.stringify(value)}`}/>
    );
}

export default React.memo<PreviewComponentProps>(PreviewComponent);
