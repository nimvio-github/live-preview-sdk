Nimvio Live Preview SDK
===

## Table of Contents

[TOC]

## Installation
**NPM**
```bash
npm i @nimvio/live-preview-sdk
```

**Yarn**
```bash
yarn add @nimvio/live-preview-sdk
```


## Usage
Note that this SDK only works in the browser. Make sure to initialize the SDK in the browser context

**Initialize the SDK**
```typescript
const nimvioSdk = WebLink.init({
  // SDK configuration
  queryParams: 'preview',
  disableWeblink: false
})
```

**Web Link**
If you have already initialized the SDK and configured the [data-attributes](#data-attributes) in your web app, you can view the web link when accessing the website with an additional query parameter as configured in the code. To disable the web link, set the `disableWeblink` configuration to `true`.

**Live Preview**
To add the live preview feature to your web app, you need to follow these steps:
1. Initialize the SDK into your web app.
2. Use the provided [live preview utility functions](#live-preview-utility-functions) to handle specific actions inside the Nimvio page.
3. *Add instructions on how to register the website so it can be seen inside the Nimvio Website Management page. It can be a link that redirects to the guide page, or an instruction*


## API Documentation
The Nimvio Live Preview SDK is a tool that allows you to automatically add interactive elements, to your webpage. These elements are created by parsing specific HTML data attributes on your webpage and injecting links to Nimvio based on those data attributes. When a user clicks on an element with these attributes, they will be redirected to Nimvio or navigate within the Nimvio Website Management page, depending on the type and the context in which it is used.

### **Data Attributes**


| Attribute              | Value | Description         |
| ---------------------- | ----- | ------------------- |
| data-nimvio-project-id | guid  | Nimvio's Project ID |
| data-nimvio-content-id | guid  | Content's ContentID |

For the data attributes placement, you just need to add it based on the context between the HTML component and the content. For example:

You have a content created in Nimvio with this structure:
```json
{
    "ContentID": "Content_2fe70b8c-72ac-4804-b137-dd1da746d7ac",
    "Data": {
        "title": "Lorem Ipsum",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "author": "John Doe"
    },
    ...
}
```
That content will be rendered using this template
```htmlmixed
<section>
    <h1>{{ title }} By: {{ author }}</h1>
    <p>
        {{description}}
    </p>
</section>
```
In order for this SDK to generate the interactive element, you need to add the `data-nimvio-content-id` attribute in that template like this:
```htmlmixed
<section data-content-id="Content_2fe70b8c-72ac-4804-b137-dd1da746d7ac">
    <h1>{{ title }} By: {{ author }}</h1>
    <p>
        {{description}}
    </p>
</section>
```
And for the `data-nimvio-project-id` attribute, you just need to set it once inside a <body> element or any other node that wraps all descendant nodes.

### **SDK Configuration**


| Key                    | Default Value | Description                                                                                                                                                                                                                                             |
| ---------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| disableWeblink                       | false              |Option to disable web-link. Web-link will still be shown if the website is opened inside the Nimvio App                                                                                                                                                                                                                                                         |
| queryParams (optional) | 'preview'     | Query parameter required that should be present in the URL to enable the SDK. E.g: queryParam: 'preview', when user access the page with additional parameter preview like https://something.com/some-page?preview it will show the highlighted element |
    
To update the configuration after the SDK initialization, you can use the setConfiguration method. Example:
```javascript
nimvioSdk.setConfiguration({
  // SDK Configuration
  disableWeblink: true
});
```

### **Live Preview Utility Functions**
This SDK has some live preview utility functions that can be used to handle actions from the Nimvio page (where this page is embedded via iframe).

#### `onPreviewContentChange(callback)`
Live Preview Utility function to handle content changes inside the Nimvio Content Editor or Website Management
##### Parameters
- `callback` - Callback function that will be called when there are changes from the Nimvio Content Editor. Only when the app is rendered inside the Nimvio's IFrame
##### Returns
An object with a destroy method to unsubscribe and remove this listener. Should be called when the app is unmounted

##### Example
```typescript
const sdk = WebLink.init()

// Save to variable to call it later
const previewChangeListener = sdk.livePreviewUtils.onPreviewContentChange((newData) => {
  // Some custom function to update the content
  const newContent = updateContentById(
    data.value,
    newData.id,
    newData.formData
  );
  if (newContent) {
    data.value = newContent;
  }
})

// Call the destroy method on the saved function when the app is unmounted to prevent memory leak
previewChangeListener.destroy()
```
#### `onIFrameRefresh(callback)`
Live Preview Utility function to handle refresh on IFrame inside the Nimvio Content Editor or Website Management
##### Parameters
- `callback` - Callback function that will be called when the user clicked refresh button on top of the IFrame. The default action will be reloading the page
##### Returns
An object with a destroy method to unsubscribe and remove this listener. Should be called when the app is unmounted

##### Example
```typescript
const sdk = WebLink.init()

// Save to variable to call it later
const iframeRefresh = sdk.livePreviewUtils.onIFrameRefresh(() => {
  // Some custom function to refetch the content
  refreshContentData()
})

// Call the destroy method on the saved function when the app is unmounted to prevent memory leak
iframeRefresh.destroy()
```

#### `onOpenPreviewContent(callback)`
Live Preview Utility function to handle content being opened inside the Nimvio Content Editor or Website Management via the content tree
##### Parameters
- `callback` - Callback function that will be called when the content being opened inside the Nimvio Content Editor via content tree
##### Returns
An object with a destroy method to unsubscribe and remove this listener. Should be called when the app is unmounted

##### Example
```typescript
const sdk = WebLink.init()

const contentOpenListener = sdk.livePreviewUtils.onOpenPreviewContent((contentData) => {
  // Some custom function to open the content page
  openContentPage(contentData)
})

// Call the destroy method on the saved function when the app is unmounted to prevent memory leak
contentOpenListener.destroy()
```

## Examples
*To be updated*