## AI Ingredient Analysis

After text recognition, the ingredients are analyzed using **ChatGPT**, which:

- explains each ingredient
- identifies potential risks or benefits
- detects undesirable additives

---

## Product Score

After the analysis, the bot assigns an **overall product score from 0 to 100**.

The score reflects:

- ingredient quality
- presence of harmful additives
- overall safety of the composition

---

## Clear Ingredient Explanation

The user receives:

- the list of detected ingredients
- a simple explanation of each component
- the reasoning behind the final score

The response is written in **clear and simple language** so that non-experts can easily understand the results.

---

# 5. System Architecture

Main system components:

- **Telegram Bot** — user interaction interface
- **Backend / n8n automation** — message processing and orchestration
- **OCR service** — text extraction from images
- **ChatGPT** — ingredient analysis and response generation

Main data flow: User → Telegram Bot → Image Processing → OCR → ChatGPT Analysis → Telegram Response

---

# 6. Data Handling

The system processes the following data:

- Telegram `user_id`
- product ingredient images
- recognized ingredient text
- analysis results

Images may be deleted after processing to minimize data storage.

---

# 7. Risks

### Technical risks

- poor image quality
- OCR recognition errors
- inaccurate ingredient analysis

### Product risks

- users interpreting the result as medical advice
- incorrect product evaluation due to incomplete ingredient detection

---

# 8. MVP Definition

The minimum viable product must include:

- Telegram bot
- ability to send a photo of ingredients
- OCR recognition of ingredient text
- ingredient analysis using **ChatGPT**
- an overall **product score from 0 to 100**
- a clear textual explanation of the ingredients
