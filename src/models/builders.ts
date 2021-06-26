import {
    CMSType,
    EnumValueConfig,
    Properties,
    PropertiesOrBuilder,
    Property,
    PropertyOrBuilder
} from "./properties";
import {
    EntitySchema,
    EntityValues,
    Navigation,
    NavigationBuilder
} from "../models";
import { AdditionalColumnDelegate, EntityCollection } from "./collections";

export function buildPropertyFrom<T extends CMSType, S extends EntitySchema<Key>, Key extends string>(
    propertyOrBuilder: PropertyOrBuilder<T, S, Key>,
    values: Partial<EntityValues<S, Key>>,
    entityId?: string
): Property<T> {
    if (typeof propertyOrBuilder === "function") {
        return propertyOrBuilder({ values, entityId });
    } else {
        return propertyOrBuilder;
    }
}

/**
 * Identity function we use to defeat the type system of Typescript and build
 * navigation objects with all its properties
 * @param navigation
 */
export function buildNavigation(
    navigation: Navigation | NavigationBuilder
): Navigation | NavigationBuilder {
    return navigation;
}

/**
 * Identity function we use to defeat the type system of Typescript and build
 * collection views with all its properties
 * @param collectionView
 */
export function buildCollection<S extends EntitySchema<Key> = EntitySchema<any>,
    Key extends string = Extract<keyof S["properties"], string>,
    AdditionalKey extends string = string>(
    collectionView: EntityCollection<S, Key, AdditionalKey>
): EntityCollection<S, Key, AdditionalKey> {
    return collectionView;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the schema keys
 * @param schema
 */
export function buildSchema<Key extends string = string>(
    schema: EntitySchema<Key>
): EntitySchema<Key> {
    return schema;
}

/**
 * Identity function that requires a builds a schema based on a type.
 * Useful if you have defined your models in Typescript.
 * The schema property keys are validated by the type system but the property
 * data types are not yet, so you could still match a string type to a
 * NumberProperty, e.g.
 * @param schema
 */
export function buildSchemaFrom<Type extends Partial<{ [P in Key]: T; }>,
    Key extends string = Extract<keyof Type, string>,
    T extends CMSType = CMSType>(
    schema: EntitySchema<Key>
): EntitySchema<Key> {
    return schema;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the property keys.
 * @param property
 */
export function buildProperty<T extends CMSType>(
    property: Property<T>
): Property<T> {
    return property;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys. It can be useful if you have entity schemas with the
 * same properties
 * @param properties
 */
export function buildProperties<Key extends string>(
    properties: Properties<Key>
): Properties<Key> {
    return properties;
}

export function buildPropertiesOrBuilder<T extends CMSType, S extends EntitySchema<Key>, Key extends string>(
    propertiesOrBuilder: PropertiesOrBuilder<S, Key>
): PropertiesOrBuilder<S, Key> {
    return propertiesOrBuilder;
}

export function buildEnumValueConfig(
    enumValueConfig: EnumValueConfig
): EnumValueConfig {
    return enumValueConfig;
}

/**
 * Identity function we use to defeat the type system of Typescript and build
 * additional column delegates views with all its properties
 * @param additionalColumnDelegate
 */
export function buildAdditionalColumnDelegate<AdditionalKey extends string = string,
    S extends EntitySchema<Key> = EntitySchema<any>,
    Key extends string = Extract<keyof S["properties"], string>>(
    additionalColumnDelegate: AdditionalColumnDelegate<AdditionalKey, S, Key>
): AdditionalColumnDelegate<AdditionalKey, S, Key> {
    return additionalColumnDelegate;
}
