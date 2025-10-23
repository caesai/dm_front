# 📚 README: Story Feature

This document provides an overview of the "Story" feature, which implements a story-viewer functionality similar to popular social media platforms. It is built using React, TypeScript, Jotai for state management, and Swiper for slide-based components.

### 📁 Project structure
The story feature is organized within the src/components/Stories directory, with sub-components organized in their own folders.
src/components/Stories/
```
├── StoriesContainer/
│   ├── StoriesContainer.module.css
│   └── StoriesContainer.tsx
├── StoriesComponents/
│   ├── Default.tsx
│   ├── Image.module.css
│   ├── Image.tsx
│   ├── Video.module.css
│   └── Video.tsx
├── StoriesProgress/
│   ├── Progress.module.css
│   ├── Progress.tsx
│   ├── ProgressArray.tsx
│   └── storiesReducer.ts
├── StoriesBlocksSwiper/
│   ├── StoriesBlock.tsx
│   ├── StoriesBlock.module.css
│   └── StoriesBlocksSwiper.tsx
├── StoriesSwiper/
│   ├── StoriesSlide.tsx
│   ├── StoriesSwiper.module.css
│   └── StoriesSwiper.tsx
├── usePreloader.ts
├── useIsMounted.ts
├── stories.types.ts
└── Stories.tsx
```
### 🧱 Component architecture

The feature is composed of several, highly-specialized components that work together to create the full story experience.

### Stories.tsx

**Purpose:** The top-level component that orchestrates the entire story feature.
Functionality:

Manages the state for activeStoryIndex (which story block is open) and isPaused (the playback state).

Uses Jotai to access and react to the global state of seen stories (localStoriesListAtom).

Sorts the storiesBlocks to move seen stories to the end.

Conditionally renders the StoriesSwiper when a story is active.

**Props:**

**storiesBlocks:** An array of IStoryBlock objects, representing individual story groups.

### StoriesBlocksSwiper.tsx

**Purpose:** Renders the horizontal list of story blocks (e.g., user avatars).

**Functionality:**
Uses Swiper to provide a touch-friendly, scrollable list.
Maps over the sorted storiesBlocks to render a StoriesBlock for each story.

Props:

**storiesBlocks:** The array of story blocks from the parent Stories component.

**openStory:** A callback to set the active story index.
StoriesSwiper.tsx

**Purpose:** Renders the full-screen, swipeable story viewer.

**Functionality:**
Uses Swiper to manage horizontal swipes between different story blocks.
Uses a key based on activeStoryIndex to force the component to re-mount when a new story block is selected, ensuring the initialSlide is correctly processed.

**Props:**

**storiesBlocks:** The sorted array of story blocks.

**activeStoryIndex:** The index of the initially selected story block.

**onClose:** A callback to close the story viewer.

**isPaused:** The current playback state.

### StoriesSlide.tsx
**Purpose:** Renders a single story block within the StoriesSwiper.
**Functionality:**
Manages updates to the Jotai atom: Triggers updates to the localStoriesListAtom when a story ends or progresses.
Keeps track of local story state (index, seen status).
Renders the StoriesContainer for the specific story block.

**Props:**

**storyId:** The ID of the current story block.

**stories:** The array of stories within this block.

**onAllStoriesEnd:** A callback to handle when all stories in the block are seen.

**isPaused:** The current playback state.

### StoriesContainer.tsx
**Purpose:** Contains and manages the playback for a single sequence of stories.

**Functionality:**
Uses useReducer to manage complex state transitions (play, pause, next, previous).
Tracks the current story ID, handles video durations, and manages user interactions.
Renders the ProgressArray and the current Story component.

**Props:**

**stories:** An array of IStory objects.

**currentIndex:** The starting index within this story block.

**isPaused:** Controls the playback state.

### StoriesProgress / ProgressArray.tsx: 
Renders the progress indicators at the top of the story viewer.

**storiesReducer.ts:** A pure reducer function used by StoriesContainer to manage story navigation state.

### StoriesComponents/
**Image.tsx:** Renders an image story with a loading state.

**Video.tsx:** Renders a video story, handling loading and playback logic.

**Custom.tsx:** Renders a component story, which can have buttons or other properties needs to be custom rendered.

**stories.types.ts** and Jotai atoms

**stories.types.ts:** Defines shared types and enums used across the story components, including the ILocalStory type.

**localStoriesListAtom.ts:** A Jotai atomWithStorage that persists the seen status and last seen index for each story block.

