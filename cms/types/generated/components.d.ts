import type { Schema, Struct } from '@strapi/strapi';

export interface EventIncludeItem extends Struct.ComponentSchema {
  collectionName: 'components_event_include_items';
  info: {
    description: "Single item in What's Included list";
    displayName: 'Include Item';
    icon: 'check';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'event.include-item': EventIncludeItem;
    }
  }
}
