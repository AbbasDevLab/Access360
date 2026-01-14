import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      appName: 'Access360',
      home: 'Home',
      enroll: 'Enroll',
      verify: 'Verify',
      // Admin User Form
      userID: 'User ID',
      fullName: 'Full Name',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      userCode: 'User Code',
      company: 'Company',
      location: 'Location',
      activeStatus: 'Active Status',
      disabled: 'Disabled',
      selectCompany: 'Select Company',
      selectLocation: 'Select Location',
      createAdminUser: 'Create Admin User',
      creating: 'Creating...',
      adminUserCreatedSuccess: 'Admin user created successfully!',
      failedToCreateAdminUser: 'Failed to create admin user',
      required: '*',
    },
  },
  ur: {
    translation: {
      appName: 'Access360',
      home: 'ہوم',
      enroll: 'اندراج',
      verify: 'تصدیق',
      // Admin User Form
      userID: 'صارف شناخت',
      fullName: 'مکمل نام',
      username: 'صارف نام',
      email: 'ای میل',
      password: 'پاس ورڈ',
      userCode: 'صارف کوڈ',
      company: 'کمپنی',
      location: 'مقام',
      activeStatus: 'فعال حیثیت',
      disabled: 'غیر فعال',
      selectCompany: 'کمپنی منتخب کریں',
      selectLocation: 'مقام منتخب کریں',
      createAdminUser: 'ایڈمن صارف بنائیں',
      creating: 'بنایا جا رہا ہے...',
      adminUserCreatedSuccess: 'ایڈمن صارف کامیابی سے بنایا گیا!',
      failedToCreateAdminUser: 'ایڈمن صارف بنانے میں ناکامی',
      required: '*',
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
