# Frontend File Structure

This file gives a general overview of the file structure for the frontend, alogn with some explanations.

```cmd
c://frontend
|   .dockerignore
|   .eslintrc.json
|   components.json
|   next.config.js
|   package-lock.json
|   package.json
|   postcss.config.js
|   README.md
|   tailwind.config.ts
|   tsconfig.json
|   yarn.lock
|
+---app
|   |   favicon.ico
|   |   globals.css
|   |   layout.tsx
|   |   page.tsx
|   |
|   +---askChat
|   |       page.tsx
|   |
|   \---datasource
|           page.tsx
|
+---components
|   +---component
|   |       askingView.tsx
|   |       DemoData_new.json
|   |       infoPanel.tsx
|   |       inputDisplay.tsx
|   |       mapComponent.tsx
|   |       mapPinMarker.tsx
|   |       markerEditor.tsx
|   |       markerList.tsx
|   |       startChatGPt.tsx
|   |       startDataSourceInput.tsx
|   |
|   +---functions
|   |       ApiUtils.ts
|   |       AutosizeTextArea.ts
|   |       EntitiesConvertor.ts
|   |       entityNameListExtractor.ts
|   |       JsonRenderer.tsx
|   |       markerEditUpdater.ts
|   |       markerToggle.ts
|   |
|   +---types
|   |       BackendResponse.ts
|   |       MapMarker.ts
|   |
|   \---ui
|       |   bbl.tsx
|       |   button.tsx
|       |   card.tsx
|       |   FormModal.tsx
|       |   icons.tsx
|       |   input.tsx
|       |   logo.tsx
|       |   markdown.tsx
|       |   navbar.tsx
|       |   scroll-area.tsx
|       |   select.tsx
|       |   textarea.tsx
|       |   toolbar.tsx
|       |
|       +---customCss
|       |       bbl.css
|       |
|       \---svg files
|               Earth.tsx
|
+---lib
|       utils.ts
|
\---public
        next.svg
        vercel.svg
```

This follows a standard NextJS File Structure where the pages are under the app sub folder and all components are under the components folder in root. 

In the file `components` there are several different sub-folders: Component, Functions, Types and UI. 

- /Component: Is where we store our whole pages or Components dependend on other parts of the Components to work.

- /Functions: This is where we store our components that do things with data or converters. Like APIUtils that talk too the backend and some Entity convereters.

- /Types: this is where we store our Types

- /UI: This is where we store our ui components lik singular Buttons, Cards, Forms and such.

We also store our Dockerfiles in the Root Folder.