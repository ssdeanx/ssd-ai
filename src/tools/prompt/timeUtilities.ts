import { PromptDefinition, PromptResult } from '../../types/prompt.js';

export const timeUtilitiesDefinition: PromptDefinition = {
  name: 'time-utilities',
  description: 'Comprehensive time management and scheduling assistant using time utility tools for timezone conversions, scheduling, and temporal calculations',
  arguments: [
    {
      name: 'task_type',
      description: 'Type of time-related task (scheduling, conversion, calculation, planning)',
      required: true
    },
    {
      name: 'context',
      description: 'Specific context or requirements for the time task',
      required: true
    },
    {
      name: 'timezones',
      description: 'Relevant timezones involved (comma-separated IANA identifiers)',
      required: false
    },
    {
      name: 'constraints',
      description: 'Any time-related constraints or deadlines',
      required: false
    }
  ]
};

export function getTimeUtilitiesPrompt(
  taskType: string,
  context: string,
  timezones: string = 'UTC',
  constraints: string = 'No specific constraints'
): PromptResult {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please assist with the following time-related task using all available time utility tools:

**Task Type:** ${taskType}
**Context:** ${context}
**Timezones:** ${timezones}
**Constraints:** ${constraints}

Use these specialized time utility tools for comprehensive time management:

## Time Management Process:

### 1. **Current Time Assessment** (get_current_time)
- Get current time in multiple formats (ISO, local, UTC, timestamp, human-readable)
- Assess current temporal context and reference points
- Establish baseline for all time calculations

### 2. **Timezone Analysis & Conversion**
- Convert times between specified timezones
- Identify optimal meeting times across timezones
- Calculate time differences and offsets

### 3. **Scheduling & Planning**
- Plan events considering timezone differences
- Calculate deadlines and milestones
- Optimize scheduling for global teams

### 4. **Temporal Calculations**
- Calculate durations and intervals
- Determine time remaining to deadlines
- Project future dates and times

### 5. **Time-Based Decision Making**
- Evaluate timing impacts on decisions
- Consider seasonal or daylight saving effects
- Analyze time-sensitive opportunities

### 6. **Documentation & Communication**
- Format time information for clear communication
- Create timezone-aware schedules and calendars
- Document time-related decisions and rationales

## Required Time Management Output:

**Current Time Context:**
- Current time in all relevant formats and timezones
- Reference points established for calculations

**Timezone Analysis:**
- Timezone relationships and conversions
- Optimal coordination times identified
- Daylight saving considerations

**Scheduling Recommendations:**
- Proposed schedules and timelines
- Timezone-aware meeting suggestions
- Deadline calculations and buffers

**Temporal Calculations:**
- Duration and interval calculations
- Time remaining assessments
- Future date projections

**Communication Plan:**
- Clear time format specifications
- Timezone notation standards
- Documentation of all time-related decisions

Provide comprehensive time management assistance that ensures accurate temporal coordination and optimal scheduling across all relevant timezones and constraints.`
        }
      }
    ]
  };
}
