# KLOSET - UI/UX Guidelines

## Design Philosophy

KLOSET's UI/UX is built on principles of:

- **Simplicity**: Less is more
- **Accessibility**: Inclusive design for all users
- **Responsiveness**: Adapts to any screen size
- **Consistency**: Predictable patterns across app
- **Delight**: Smooth animations & interactions

---

## Color System

### Primary Palette

#### Light Theme

| Element            | Color                 | Usage                |
| ------------------ | --------------------- | -------------------- |
| Background         | `#F8FAFC` (Slate 50)  | App background       |
| Text Primary       | `#0F172A` (Slate 900) | Headings, main text  |
| Text Secondary     | `#64748B` (Slate 600) | Subtitles, help text |
| Border             | `#E2E8F0` (Slate 200) | Dividers, borders    |
| Card               | `#FFFFFF`             | Card backgrounds     |
| Tint (Primary)     | `#6366F1` (Indigo)    | CTA, active states   |
| Accent (Secondary) | `#EC4899` (Pink)      | Highlights, likes    |

#### Dark Theme

| Element            | Color                     | Usage                |
| ------------------ | ------------------------- | -------------------- |
| Background         | `#0F172A` (Slate 900)     | App background       |
| Text Primary       | `#F8FAFC` (Slate 50)      | Headings, main text  |
| Text Secondary     | `#94A3B8` (Slate 400)     | Subtitles, help text |
| Border             | `#334155` (Slate 700)     | Dividers, borders    |
| Card               | `#1E293B` (Slate 800)     | Card backgrounds     |
| Tint (Primary)     | `#818CF8` (Pastel Indigo) | CTA, active states   |
| Accent (Secondary) | `#F472B6` (Pastel Pink)   | Highlights, likes    |

### Color Usage Guidelines

```
🎨 Primary (Indigo):
├─ Button CTAs
├─ Active tab indicators
├─ Links
└─ Focus states

🎨 Secondary (Pink):
├─ Like/favorite buttons
├─ Accent highlights
└─ Success states

🎨 Neutral (Slate):
├─ Text (900/50)
├─ Borders (200/700)
├─ Icons (400/600)
└─ Disabled states
```

---

## Typography

### Font Stack

**Primary**: SpaceMono
**Fallback**: System font

### Font Sizes & Weights

| Use Case   | Size | Weight         | Line Height |
| ---------- | ---- | -------------- | ----------- |
| Heading 1  | 32px | Bold (700)     | 1.25        |
| Heading 2  | 24px | Bold (700)     | 1.33        |
| Heading 3  | 20px | SemiBold (600) | 1.4         |
| Body Large | 18px | Regular (400)  | 1.5         |
| Body       | 16px | Regular (400)  | 1.5         |
| Body Small | 14px | Regular (400)  | 1.43        |
| Caption    | 12px | Medium (500)   | 1.33        |
| Overline   | 11px | Medium (500)   | 1.45        |

### Text Component

```typography
// Themed text
<Text style={styles.heading}>Wardrobe</Text>

// Automatically uses theme colors
// Light theme: #0F172A (dark)
// Dark theme: #F8FAFC (light)
```

---

## Spacing System

### Base Unit: 4px

| Token | Size | Usage               |
| ----- | ---- | ------------------- |
| xs    | 4px  | Micro spacing       |
| sm    | 8px  | Compact spacing     |
| md    | 12px | Standard padding    |
| lg    | 16px | Card padding        |
| xl    | 24px | Section spacing     |
| xxl   | 32px | Large spacing       |
| xxxl  | 48px | Extra large spacing |

### Spacing Examples

```typescript
// Container padding
paddingHorizontal: 16  // lg

// Button spacing
paddingVertical: 12,   // md
paddingHorizontal: 16  // lg

// Section margin
marginVertical: 24     // xl

// Item gap in list
gap: 12                // md
```

---

## Component Design Patterns

### Buttons

#### Primary Button (CTA)

```
Background: #6366F1 (Indigo)
Text: White
Padding: 12px vertical, 16px horizontal
BorderRadius: 8px
Active Opacity: 0.8
```

**Usage**: Main actions (Login, Submit, Save)

#### Secondary Button

```
Background: Transparent
Border: 1px #E2E8F0 (Light) / #334155 (Dark)
Text: #6366F1 (Indigo)
Padding: 12px, 16px
BorderRadius: 8px
```

**Usage**: Alternative actions

#### Tertiary Button (Text Only)

```
Background: Transparent
Text: #6366F1 (Indigo)
No border
Underline on hover
```

**Usage**: Links within content

#### Danger Button

```
Background: #EF4444 (Red)
Text: White
Same padding/radius as primary
```

**Usage**: Delete, logout

### Input Fields

#### Text Input

```
Height: 48px
Padding: 12px 16px
BorderRadius: 8px
Border: 1px #E2E8F0 (Light) / #334155 (Dark)
Focus Border: #6366F1 (Indigo)
Font Size: 16px
```

**Left Icon**: 12px margin
**Right Icon**: Clear/visibility button

### Cards

#### Standard Card

```
Background: White (Light) / #1E293B (Dark)
BorderRadius: 12px
Padding: 16px
Shadow:
  iOS: shadowOpacity: 0.1
  Android: elevation: 2
Border: 1px bottom #E2E8F0
```

### Tab Bar

#### Active Tab

```
Tint: #6366F1 (Indigo)
Font Weight: 600
Icon Size: 24px
```

#### Inactive Tab

```
Tint: #94A3B8 (Slate 400)
Font Weight: 500
Icon Size: 24px
```

---

## Layout Patterns

### Safe Area

```typescript
// Respects notches, home indicators, status bar
<SafeAreaView>
  <Content />
</SafeAreaView>
```

### Grid Layout

**Wardrobe screen**: 2-column grid

```
Item Width = (screenWidth - 48px) / 2
Item Height = Item Width (square)
Gap = 12px horizontal, 16px vertical
```

### List Layout

**Profile screen**: Full-width items

```
Item Height: Varies (auto)
Padding: 16px horizontal
Gap: 12px vertical
```

---

## Animation & Motion

### Transition Speeds

```
Fast:     200ms   (Quick feedback)
Standard: 300ms   (Normal animations)
Slow:     500ms   (Important emphasis)
```

### Animation Types

#### Screen Transitions

```
Fade in/out: 300ms, easeInOut
Slide: 300ms, easeInOut
```

#### Component Animations

```
Button press: Opacity change (200ms)
Tab switch: Slide (300ms)
Like/Dislike: Scale + Fade (300ms)
```

### React Native Reanimated Usage

```typescript
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

<Animated.View entering={FadeIn} exiting={FadeOut}>
  <Content />
</Animated.View>
```

---

## Accessibility

### Touch Targets

- **Minimum Size**: 48x48 points (Apple HIG)
- **Recommended**: 56x56 points
- **Spacing**: 8px between targets

### Color Contrast

- **Normal Text**: 4.5:1 minimum
- **Large Text**: 3:1 minimum
- **Interactive Elements**: 3:1 minimum

### Label & Hint Text

```typescript
// Always provide accessibilityLabel
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Add wardrobe item"
  onPress={handleAdd}>
  <Plus />
</TouchableOpacity>
```

### Screen Reader Support

```typescript
// Mark purely decorative items
<View accessible={false} />

// Group related items
<View accessible={true} accessibilityRole="group">
  {/* ... */}
</View>
```

---

## Responsive Design

### Breakpoints

```
Mobile:    0 - 479px   (Phone)
Tablet:    480 - 839px (Tablet portrait)
Desktop:   840px+      (Tablet landscape, desktop)
```

### Responsive Adjustments

```typescript
const { width } = Dimensions.get("window");

const GRID_COLUMNS = width > 800 ? 3 : 2;
const PADDING = width > 600 ? 24 : 16;
const FONT_SIZE = width > 600 ? 18 : 16;
```

### Platform-Specific Styling

```typescript
import { Platform } from "react-native";

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.select({
      ios: 16,
      android: 8,
      web: 0,
    }),
  },
});
```

---

## Error States & Feedback

### Error Messages

```
Location: Below input or in toast
Color: #EF4444 (Red)
Icon: AlertCircle or X
Message: Clear, actionable text
```

### Success Feedback

```
Toast: "Item added to wardrobe" (2 seconds)
Color: #10B981 (Green)
Icon: Check
Position: Bottom center
```

### Loading States

```
Loading Indicator: Activity spinner
Text: "Loading..." (optional)
Opacity: 0.6
Disable interactions: Yes
```

---

## Dark Mode

### Implementation

```typescript
import { useColorScheme } from '@/components/useColorScheme';

const colorScheme = useColorScheme();
const theme = Colors[colorScheme];

<View style={{ backgroundColor: theme.background }} />
```

### Automatic Detection

- Respects system dark mode preference
- Updates when system setting changes
- Manual override coming in Phase 2

### Dark Mode Testing

**iOS**: Settings > Developer > Dark Appearance
**Android**: Settings > Display > Dark theme

---

## Icon System

### Icon Library

**Library**: lucide-react-native
**Size**: 24px (standard), 18px (small), 32px (large)
**Color**: Uses theme colors

### Icon Usage

```typescript
import { Plus, Home, Heart, Settings } from 'lucide-react-native';

<Plus size={24} color={theme.tint} strokeWidth={2} />
```

### Commonly Used Icons

- Navigation: Home, Heart, Settings, User
- Actions: Plus, Edit, Delete, Share
- Status: Check, X, AlertCircle, Info
- Media: Image, Camera, Gallery

---

## Form Design

### Onboarding Form

```
Title: Large, bold, centered
Subtitle: Smaller, gray, centered
Options: Chips/buttons (not radios)
Selected: Indigo background, white text
Submit: Full-width primary button at bottom
```

### Upload Form

```
Image Preview: Large square, centered
Metadata: Dropdowns and inputs
Tags: Text input with comma support
Submit: Full-width button at bottom
```

### Login Form

```
Title: Brand name + tagline
Inputs: Email, password stacked
Icons: Inside left side of input
CTA: "Login" or "Continue"
Links: Links below (Signup, Forgot Password)
Secondary: "Continue as Guest" button
```

---

## Modals & Overlays

### Modal Presentation

```
Animation: Slide up from bottom
Overlay: Translucent dark backdrop
Content: Rounded top corners
Safe Area: Respects bottom
Dismiss: Swipe down or X button
```

### Alert/Confirmation

```
Title: Bold, centered
Message: Regular, centered
Buttons: Stacked vertically
Primary: Default action
Secondary: Cancel action
```

---

## Status Indicators

### Badge

```
Background: #6366F1 (Indigo)
Text: White, small font
Padding: 4px 8px
BorderRadius: 4px
Usage: New items, counts
```

### Chip

```
Background: Transparent
Border: 1px #E2E8F0
Padding: 8px 12px
BorderRadius: 20px
Selected: #6366F1 background, white text
Usage: Filters, tags, selections
```

### Avatar

```
Size: 40px (standard), 56px (large)
Background: #6366F1 with opacity
Icon: User symbol, white
BorderRadius: 50%
```

---

## Loading Patterns

### Skeleton Screen

```
Instead of spinner showing:
├─ Placeholder cards
├─ Shimmer animation
└─ Approximate content shape
```

### Progress Indicator

```
For step-by-step flows:
├─ Dots/circles for each step
├─ Current filled, others empty
├─ Connected line between steps
└─ Step number or title below
```

### Infinite Scroll

```
Load next page when:
├─ User scrolls within 100px of bottom
├─ Show loading indicator
└─ Append new items
```

---

## Micro-interactions

### Button Press

```
1. Start: Normal state
2. Press: Scale 0.95, opacity 0.8 (200ms)
3. Release: Spring back to normal (300ms)
4. Result: Provide feedback (text change, navigation, etc)
```

### Swipe Card

```
1. Start: Card centered
2. Drag: Track finger movement
3. Release:
   - If > 50% dragged: Slide off (300ms)
   - If < 50%: Spring back (200ms)
4. Result: Action (like/dislike) + next card slides in
```

### Pull to Refresh

```
1. Pull: Down arrow appears, rotates
2. Release: Refresh triggered, spinner shows
3. Complete: Spinner disappears, content updates
```

---

## Empty States

### Empty Wardrobe

```
Icon: Large, light color
Heading: "No items yet"
Description: "Add your first item to get started"
CTA: "Upload Item" button
Image: Illustrated placeholder (optional)
```

### No Search Results

```
Icon: Search icon with X
Heading: "No results found"
Description: "Try different keywords"
CTA: "Clear search" or "Back"
```

---

## Performance Considerations

### Image Loading

```javascript
// Use optimized images
<Image
  source={{ uri: url }}
  placeholder={require("./placeholder.png")}
  style={{ width: 200, height: 200 }}
/>
```

### List Optimization

```typescript
// Use FlatList with keyExtractor
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <Item {...item} />}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
/>
```

---

## UX Writing

### Tone

- Friendly, accessible
- Conversational but professional
- Action-oriented (verbs first)
- Error messages: Helpful, not blame

### Button Labels

```
✅ Good:
- "Add to Wardrobe"
- "Try Another Outfit"
- "Save Profile"

❌ Avoid:
- "Submit"
- "OK"
- "Go"
```

### Error Messages

```
✅ Good:
"Please select a body type to continue"

❌ Bad:
"Error: Validation failed"
```

---

## Device-Specific Notes

### iPhone Notch

- Handled automatically by SafeAreaView
- Extra padding on sides for notch devices

### Android Navigation Buttons

- Account for back button in layouts
- Use edge-to-edge for immersive feel
- Gesture navigation compatible

### Web

- Touch targets still 48px
- Cursor feedback for hover states
- Keyboard navigation support

---

## Accessibility Checklist

- [ ] All interactive elements 48x48pt minimum
- [ ] 4.5:1 color contrast for text
- [ ] Screen reader labels on all buttons
- [ ] Keyboard navigation support
- [ ] No text-only images (provide alt text)
- [ ] Color not only differentiator
- [ ] Focus indicators visible
- [ ] Tests with accessibility tools

---

## Component Variant Examples

### Button Variations

```typescript
// Primary
<Button variant="primary" label="Save" />

// Secondary
<Button variant="secondary" label="Cancel" />

// Danger
<Button variant="danger" label="Delete" />

// Disabled
<Button variant="primary" label="Save" disabled />

// Loading
<Button variant="primary" label="Saving..." loading />
```

---

## Conclusion

KLOSET's UI/UX system provides:

- **Consistency**: Predictable, recognizable patterns
- **Accessibility**: Inclusive design for all users
- **Responsiveness**: Works on any device
- **Delight**: Smooth, purposeful interactions
- **Maintainability**: Clear guidelines for developers

Following these guidelines ensures cohesive, professional, and user-friendly experiences.

---

**Last Updated**: June 2026  
**Design System Version**: 1.0  
**Accessibility Standard**: WCAG 2.1 AA  
**Theme Support**: Light & Dark modes
