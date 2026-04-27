---
name: c4-components-to-tasks
description: Analyze C4 architecture documentation in docs/c4 and derive implementation tasks from container components. Use when the user asks to break architecture into technical tasks, generate backlog from C4 docs, map containers to components, or create task files from architecture documentation.
---

# C4 Components to Tasks

Turn C4 documentation into actionable technical tasks for implementation.

## When to Use

Use this skill when the user asks to:
- read architecture docs in `docs/c4`
- identify container-level components (C4 Level 3)
- transform components into concrete implementation tasks
- generate task markdown files in `docs/tasks`

## Inputs

- C4 docs in `docs/c4/*.md`
- Any architecture source explicitly referenced by the user (for example, `arquitetura.c4` if present)
- Existing project rules and conventions already active in this repository

## Output Contract

Always produce:
1. `docs/tasks/tasks.md` as an index of all generated task files.
2. One file per container in `docs/tasks/<container-slug>.md` with structured technical tasks.

If `docs/tasks` does not exist, create it first.

## Workflow

Copy and track this checklist:

```markdown
Task Progress:
- [ ] Step 1: Read architecture sources
- [ ] Step 2: Extract containers and components
- [ ] Step 3: Convert components into technical tasks
- [ ] Step 4: Apply project rules and constraints
- [ ] Step 5: Write docs/tasks/tasks.md index
- [ ] Step 6: Write docs/tasks/<container-slug>.md files
- [ ] Step 7: Validate consistency and completeness
```

### Step 1: Read architecture sources

Read all files from `docs/c4/*.md` and any user-specified architecture file.

Capture:
- system scope
- container names
- known integrations and data stores
- explicit component names or responsibilities

### Step 2: Extract containers and components

For each container:
- list components already documented
- if components are missing, infer reasonable Level 3 components from responsibilities
- keep names stable and architecture-aligned

### Step 3: Convert components into technical tasks

Convert each component into implementation tasks that are specific and executable.

Good task style:
- "Create endpoint `POST /properties` with validation and error handling"
- "Configure `properties` table with indexes and foreign keys"
- "Implement `PropertySearchService` with filter and pagination support"

Avoid vague tasks:
- "Work on backend"
- "Build component"

### Step 4: Apply project rules and constraints

Before finalizing tasks:
- apply repository rules and conventions currently enforced in this project
- align task wording with existing stack and architecture decisions
- avoid tasks that conflict with project standards

### Step 5: Write index file

Create `docs/tasks/tasks.md` with:
- architecture sources used
- generation date
- container list
- links to each `docs/tasks/<container-slug>.md`

### Step 6: Write one file per container

For each container, create `docs/tasks/<container-slug>.md` using this template:

```markdown
# <Container Name> - Technical Tasks

## Scope
Short description of the container responsibility.

## Components (Level 3)
- <Component A>
- <Component B>

## Tasks
### 1) <Task title>
- **Component:** <Component name>
- **Type:** API | Database | Service | UI | Infra | Integration | Test
- **Description:** <what must be implemented>
- **Acceptance Criteria:**
  - [ ] <criterion 1>
  - [ ] <criterion 2>
- **Dependencies:** <optional>

### 2) <Task title>
...

## Suggested Execution Order
1. <task or milestone>
2. <task or milestone>
```

## Quality Checks

Before finishing:
- every container has a matching task file
- every listed component maps to at least one concrete task
- tasks are implementation-ready (clear verb + target artifact)
- acceptance criteria are testable
- `docs/tasks/tasks.md` links are valid

## Naming Rules

- Use lowercase kebab-case for `<container-slug>`.
- Keep task titles concise and action-oriented.
- Prefer stable technical nouns already used in architecture docs.
