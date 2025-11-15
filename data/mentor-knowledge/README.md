# Mentor Knowledge Base Data

This folder contains the extracted knowledge from 200+ entrepreneurship books for the EERA Mentor RAG system.

## File Structure

- `books.json` - Main data file with all 200 books in structured format
- `test-books.json` - (Optional) Subset of books for testing ingestion

## Expected JSON Format

Each book should follow this structure:

```json
{
  "title": "Book Title",
  "author": "Author Name",
  "category": "Category",
  "tags": ["tag1", "tag2"],
  "layer_1_meta_summary": {
    "core_thesis": "...",
    "problem_statement": "...",
    "target_audience": "...",
    "promised_transformation": "...",
    "key_ideas": []
  },
  "layer_2_concepts_frameworks": [
    {
      "name": "Framework Name",
      "type": "framework|principle|model|mental_model",
      "description": "...",
      "components": [],
      "when_it_applies": "...",
      "limitations": "..."
    }
  ]
}
```

## Instructions

1. Export your Notion database as JSON
2. Place the file here as `books.json`
3. Optionally create `test-books.json` with 5-10 books for initial testing
4. Let the AI know when the file is ready for ingestion

## Notes

- The ingestion process will read this file and populate the Supabase `mentor_knowledge_base` table
- Each framework/principle will be embedded and indexed for semantic search
- Total expected size: ~5-10MB for 200 books

