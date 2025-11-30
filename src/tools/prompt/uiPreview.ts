import { PromptDefinition, PromptResult } from '../../types/prompt.js';

export const uiPreviewDefinition: PromptDefinition = {
  name: 'ui-preview',
  description: 'User interface design and visualization using ASCII art preview tools for rapid prototyping and design communication',
  arguments: [
    {
      name: 'ui_description',
      description: 'Detailed description of the user interface to preview',
      required: true
    },
    {
      name: 'design_context',
      description: 'Context for the UI design (web app, mobile, desktop, dashboard, etc.)',
      required: false
    },
    {
      name: 'preview_style',
      description: 'Visual style preference (minimal, detailed, schematic, wireframe)',
      required: false
    },
    {
      name: 'key_elements',
      description: 'Specific UI elements to emphasize in the preview',
      required: false
    },
    {
      name: 'layout_focus',
      description: 'Layout aspects to highlight (responsive, grid-based, component-based)',
      required: false
    }
  ]
};

export function getUiPreviewPrompt(
  uiDescription: string,
  designContext: string = 'web application',
  previewStyle: string = 'detailed',
  keyElements: string = 'main components',
  layoutFocus: string = 'responsive design'
): PromptResult {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please create ASCII art UI previews for the following interface design using the specialized UI preview tool:

**UI Description:** ${uiDescription}
**Design Context:** ${designContext}
**Preview Style:** ${previewStyle}
**Key Elements:** ${keyElements}
**Layout Focus:** ${layoutFocus}

Use the ASCII art UI preview tool for rapid interface visualization and design communication:

## UI Preview Process:

### 1. **Design Analysis** (preview_ui_ascii)
- Analyze the UI description and extract key components
- Identify layout structure and visual hierarchy
- Determine appropriate ASCII representation techniques
- Plan the preview composition and scale

### 2. **Component Visualization**
- Create ASCII representations of UI components (buttons, inputs, navigation, etc.)
- Show interactive elements and their states
- Represent data display components (tables, cards, lists)
- Illustrate layout containers and spacing

### 3. **Layout Structure**
- Demonstrate responsive layout behavior
- Show grid systems and alignment
- Illustrate navigation patterns and information architecture
- Represent different screen sizes and breakpoints

### 4. **Interaction Design**
- Indicate clickable elements and interactive zones
- Show hover states and feedback mechanisms
- Represent modal dialogs and overlays
- Illustrate transition and animation concepts

### 5. **Visual Hierarchy**
- Use ASCII characters to show importance levels
- Demonstrate typography scale and emphasis
- Represent color and contrast concepts
- Show spacing and visual rhythm

### 6. **Contextual Integration**
- Place the UI within its design context
- Show relationships between components
- Illustrate user flow and interaction patterns
- Represent the complete user experience

## Required UI Preview Output:

**Component Breakdown:**
- Individual UI component ASCII representations
- Interactive element identification
- State variations and transitions
- Accessibility considerations

**Layout Visualization:**
- Complete page/screen layout in ASCII
- Responsive breakpoint demonstrations
- Grid system representation
- Spacing and alignment illustration

**Interaction Mapping:**
- Clickable area identification
- User flow indication
- State change representations
- Feedback mechanism visualization

**Design Rationale:**
- ASCII representation choices explanation
- Design decision justifications
- Usability consideration highlights
- Technical feasibility notes

**Implementation Notes:**
- CSS framework suggestions
- Component library recommendations
- Responsive design techniques
- Accessibility implementation guidance

**Usage Guidelines:**
- How to interpret the ASCII preview
- Scaling and adaptation considerations
- Browser compatibility notes
- Performance optimization tips

Provide comprehensive ASCII art UI previews that effectively communicate design intent, facilitate stakeholder understanding, and support rapid prototyping decisions.`
        }
      }
    ]
  };
}
