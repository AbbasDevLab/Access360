import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      appName: 'Access360',
      home: 'Home',
      enroll: 'Enroll',
      verify: 'Verify',
    },
  },
  ur: {
    translation: {
      appName: 'Access360',
      home: 'ہوم',
      enroll: 'اندراج',
      verify: 'تصدیق',
    },
  },
}

export function setupI18n(lang = 'en') {
  if (i18next.isInitialized) return i18next

  i18next.use(initReactI18next).init({
    resources,
    lng: lang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })

  return i18next
}

export default i18next
