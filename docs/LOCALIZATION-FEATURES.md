# Localization & Translation Features

## Overview
Comprehensive multilingual support with AI-powered translation has been added to the property management system, supporting English, Czech, and Italian languages.

## Completed Features

### 1. ✅ Czech Language Support in Property Creation

All property fields now support three languages:
- **English (EN)** - Primary language
- **Czech (CS)** - Added for Czech market
- **Italian (IT)** - For Italian market

#### Updated Fields:
- **Title**: 3-column layout for EN/CS/IT
- **Description**: Full description in all 3 languages with character counters
- **SEO Title**: Optimized titles for each language (60 char limit)
- **Meta Description**: Search descriptions in all languages (160 char limit)
- **Location**: City names in multiple languages

### 2. ✅ AI Translation with OpenAI

**API Endpoint:** `POST /api/translate`

#### Features:
- Automatic translation from English to Czech or Italian
- Context-aware translations for real estate content
- Preserves numbers, measurements, and proper nouns
- Professional tone maintained across languages
- Uses GPT-4o-mini model for cost-effectiveness

#### Implementation:
```javascript
// Translation button in property form
<Button onClick={() => handleTranslate('description', 'en', 'cs')}>
  <Languages className="h-3 w-3 mr-1" />
  Translate from EN
</Button>
```

#### Usage:
1. Fill in English description/title
2. Click "Translate from EN" button next to Czech/Italian fields
3. AI automatically translates while preserving formatting
4. Edit generated translation as needed

#### Configuration:
Add to environment variables:
```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini  # Optional, defaults to gpt-4o-mini
```

### 3. ✅ Property Detail Page Localization

The property detail page now fully responds to language switching:

#### Dynamic Content:
- **Property Title**: Shows in selected language
- **Description**: Full localized descriptions
- **Location**: City names in user's language
- **Section Headers**: All translated (Description, Amenities, Property Details)
- **Labels**: Year Built, Renovated, Lot Size, Property Type
- **Action Buttons**: Schedule Viewing, Virtual Tour, Calculate Mortgage
- **Form Labels**: Contact form in user's language

#### Language Switching:
- Instant response to language changes from navbar
- No page refresh required
- Smooth content transition
- Fallback to English if translation missing

### 4. ✅ Navigation Component Enhancement

**Location:** `components/Navigation.js`

#### Features:
- Language selector in navbar (EN/CS/IT)
- Persists language choice in localStorage
- Broadcasts language changes via custom event
- Updates document language attribute
- Animated hover effects showing all languages

#### Event System:
```javascript
// Navigation broadcasts changes
window.dispatchEvent(new CustomEvent('languageChange', { detail: 'cs' }))

// Pages listen for changes
window.addEventListener('languageChange', (e) => {
  setLanguage(e.detail)
})
```

### 5. ✅ Helper Functions

#### getLocalizedText()
```javascript
const getLocalizedText = (field, fallback = 'Not specified') => {
  if (!field) return fallback
  if (typeof field === 'string') return field
  return field[language] || field['en'] || field['it'] || field['cs'] || fallback
}
```

Intelligently extracts localized text:
- Checks current language first
- Falls back to English, then Italian, then Czech
- Returns any available translation
- Handles string and object formats

## Language Support Matrix

| Component | EN | CS | IT | Notes |
|-----------|:--:|:--:|:--:|-------|
| Property Title | ✓ | ✓ | ✓ | Required field |
| Property Description | ✓ | ✓ | ✓ | AI translatable |
| SEO Title | ✓ | ✓ | ✓ | 60 char limit |
| Meta Description | ✓ | ✓ | ✓ | 160 char limit |
| Location Names | ✓ | ✓ | ✓ | City/region names |
| Property Detail Labels | ✓ | ✓ | ✓ | UI labels |
| Action Buttons | ✓ | ✓ | ✓ | CTA buttons |
| Navigation | ✓ | ✓ | ✓ | Login/Register |
| Form Labels | ✓ | ✓ | ✓ | Contact forms |

## Translation Workflow

### Recommended Process:
1. **Create Property** → Enter all basic info
2. **Write English Description** → Most detailed version
3. **AI Translate** → Use translate buttons for CS and IT
4. **Review & Edit** → Adjust AI translations as needed
5. **Add SEO Content** → Translate SEO fields similarly
6. **Save** → All languages stored together

### Best Practices:
- ✅ Always fill English first (best AI source)
- ✅ Review AI translations for accuracy
- ✅ Keep consistent terminology across languages
- ✅ Use Czech for Czech market-specific features
- ✅ Verify numbers and measurements unchanged
- ✅ Test switching languages on live page

## Property Data Structure

```javascript
{
  title: { en: 'Luxury Villa', cs: 'Luxusní vila', it: 'Villa di Lusso' },
  description: { en: '...', cs: '...', it: '...' },
  seoTitle: { en: '...', cs: '...', it: '...' },
  seoDescription: { en: '...', cs: '...', it: '...' },
  location: {
    city: {
      name: { en: 'Florence', cs: 'Florencie', it: 'Firenze' }
    }
  },
  // ... other fields
}
```

## User Experience

### Language Switching:
1. User clicks language button in navbar (EN/CS/IT)
2. Language choice saved to localStorage
3. Custom event fired immediately
4. All pages update content instantly
5. Page state maintained (no refresh)

### Visual Feedback:
- Active language highlighted in navbar
- Smooth transitions between languages
- Character counters for all text fields
- Loading states during AI translation
- Success messages after translation

## Technical Implementation

### Frontend:
- React useState for language state
- useEffect for event listeners
- localStorage for persistence
- Custom events for cross-component communication

### Backend:
- Next.js API Routes
- OpenAI API integration
- Sanity CMS for multilingual storage
- GROQ queries for flexible data fetching

### Database:
- Sanity stores all languages in same document
- No separate documents per language
- Efficient querying and updates
- Version control for all translations

## Performance Considerations

### AI Translation:
- **Cost**: ~$0.0001 per translation (GPT-4o-mini)
- **Speed**: 1-3 seconds average
- **Quality**: Professional real estate language
- **Rate Limits**: Respects OpenAI limits
- **Error Handling**: Graceful failures with user feedback

### Language Switching:
- **Instant**: No API calls needed
- **Local**: Data already loaded
- **Smooth**: React state updates
- **Persistent**: Saved preferences

## Future Enhancements

Potential additions:
- [ ] Batch translate all fields at once
- [ ] Translation memory for consistency
- [ ] Auto-detect source language
- [ ] Support for more languages (German, French, Spanish)
- [ ] Translation quality scoring
- [ ] Professional translator review workflow
- [ ] Translation cost tracking
- [ ] A/B testing different translations
- [ ] SEO performance by language
- [ ] Language-specific property recommendations

## Troubleshooting

### Translation Not Working:
- Check OPENAI_API_KEY is set correctly
- Verify API key has sufficient credits
- Check browser console for error messages
- Ensure source text (EN) exists before translating

### Language Not Switching:
- Check localStorage is enabled in browser
- Verify Navigation component is mounted
- Check browser console for event dispatch
- Clear browser cache if stuck

### Missing Translations:
- System falls back to English automatically
- Check if content was saved in Czech/Italian
- Use getLocalizedText() helper function
- Verify GROQ queries include all language fields

## Environment Variables

```env
# Required for AI Translation
OPENAI_API_KEY=sk-...your-key-here

# Optional
OPENAI_MODEL=gpt-4o-mini  # or gpt-4, gpt-3.5-turbo

# Sanity (already configured)
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-token
```

## Testing

### Manual Testing:
1. Create new property with EN description
2. Click translate button for CS
3. Verify Czech translation appears
4. Repeat for IT
5. Save property
6. View property detail page
7. Switch languages in navbar
8. Verify all content changes language
9. Check fallbacks work for missing translations

### Edge Cases Handled:
- ✅ Missing translations fall back gracefully
- ✅ Empty fields don't break translation
- ✅ Special characters preserved
- ✅ Long text handled properly
- ✅ Numbers and measurements unchanged
- ✅ Mixed language content works
- ✅ Old properties without CS work fine

## Support

For issues or questions:
- Check environment variables are set
- Review error messages in console
- Verify OpenAI API key permissions
- Ensure sufficient API credits
- Test in incognito mode for cache issues

