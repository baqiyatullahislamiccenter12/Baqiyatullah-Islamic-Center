# Updating events and announcements

This website uses GitHub Pages. Events and announcements are stored in `content.json`; you do not need to edit the HTML or JavaScript to update the lists.

## Add an event

1. Open the repository on GitHub.
2. Open `content.json`.
3. Click the pencil icon to edit.
4. Add an object inside the `events` array. Use the format below.
5. Click **Commit changes**. GitHub Pages will publish the change after its deployment finishes.

```json
{
  "events": [
    {
      "date": "2026-11-15",
      "title": {
        "es": "Título del evento",
        "en": "Event title",
        "ur": "پروگرام کا عنوان"
      },
      "description": {
        "es": "Descripción confirmada del evento.",
        "en": "Confirmed event description.",
        "ur": "پروگرام کی تصدیق شدہ تفصیل۔"
      },
      "location": {
        "es": "Málaga",
        "en": "Málaga",
        "ur": "ملاگا"
      }
    }
  ],
  "announcements": []
}
```

Use dates in `YYYY-MM-DD` format. Past dated events are hidden automatically. If an event has no date, it will not be filtered by date.

## Add an announcement

Add an object inside the `announcements` array. A title is required; description is optional. You can use the same multilingual object format as the event above.

```json
{
  "events": [],
  "announcements": [
    {
      "title": {
        "es": "Aviso importante",
        "en": "Important announcement",
        "ur": "اہم اعلان"
      },
      "description": {
        "es": "Texto confirmado del aviso.",
        "en": "Confirmed announcement text.",
        "ur": "اعلان کا تصدیق شدہ متن۔"
      }
    }
  ]
}
```

## Important notes

- Replace all example text with information confirmed by the center before publishing.
- Keep the JSON valid: use double quotes, commas between fields, and no comma after the last field.
- Translate the title and description into Spanish, English, and Urdu when possible. If one translation is missing, the site falls back to another available language.
- To remove an item, delete its object from the relevant array.
- This is a simple GitHub editing workflow, not a separate admin panel. Anyone editing the file needs appropriate repository access.
