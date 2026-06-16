import React, { createContext, useContext, useState, useEffect } from "react";

// Translations Map
export const translations = {
  en: {
    // Nav & Sidebar
    dashboard: "Dashboard Overview",
    expenses: "Expense Manager",
    income: "Income Manager",
    analytics: "Financial Analytics",
    predictions: "AI Predictions",
    settings: "Settings",
    profile: "Profile",
    logout: "Logout",
    welcome: "Welcome",
    
    // Dashboard
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    savings: "Savings",
    dailySafeBudget: "Daily Safe Budget",
    nextDays: "Next Days",
    smartAlerts: "Smart Alerts",
    recentActivity: "Recent Activity",
    expenseBreakdown: "Expense Breakdown",
    noTransactions: "Log your first income and expense details to calculate automated intelligence insights!",
    noRecentActivity: "No recent transactions recorded here.",
    noExpensesMonth: "No expenses recorded this month.",
    alertExpensesOutpaced: "⚠️ Alert: Your expenses outpaced earnings for this period by ₹{amount}!",
    alertSavingsSuccess: "✨ Great job! You managed to keep {percent}% of your total revenue stream.",
    alertSafeHeadroom: "Based on historical logging habits, your safe spending headroom sits at ₹{amount} daily.",
    
    // Expense / Income Managers
    addExpense: "Add Expense Record",
    addIncome: "Add Income Source",
    amountPlaceholder: "Amount ₹",
    specifyCategory: "Specify Category",
    specifyType: "Specify Type",
    addButton: "Add",
    ledgerExpense: "Expense Ledger",
    ledgerIncome: "Income Ledger",
    dateCol: "Date",
    categoryCol: "Category",
    amountCol: "Amount",
    actionCol: "Action",
    deleteButton: "Delete",
    noExpensesFound: "No expense records found for this month.",
    noIncomeFound: "No income records found for this month.",
    
    // Analytics
    downloadCSV: "Download CSV Report",
    downloadPDF: "Download PDF Charts",
    selectAnalysisPeriod: "Select Analysis Period",
    monthWeekView: "🗓️ Month/Week View",
    customRange: "🔎Custom Range",
    yearLabel: "Year",
    monthLabel: "Month",
    weekTracker: "Week Tracker",
    fullMonthView: "Full Month View",
    runAnalysis: "Run Analysis",
    fromLabel: "From",
    toLabel: "To",
    expensesSelection: "Expenses in Selection",
    savingsRemaining: "Savings (Remaining)",
    expenseVsSavingsChart: "Expense Categories vs Savings",
    dailyBreakdownChart: "Daily Breakdown (Stacked)",
    trendChart: "Savings (Green) vs Expenses (Red) Trend",
    loadingAnalysis: "Running Custom Analysis...",
    selectRangePrompt: "Select a date range and click Run Analysis",
    
    // Predictions
    aiTitle: "🤖 AI Financial Intelligence",
    periodIncome: "Period Income",
    periodExpense: "Period Expense",
    transactionsCount: "Transactions",
    nextMonthForecast: "Next Month Forecast",
    predictedSavings: "Predicted Savings",
    aiInsight: "AI Insight",
    financialDeepDive: "📊 Financial Deep Dive",
    strategicRecommendations: "Strategic Recommendations",
    aiOffline: "AI engine offline — using built-in predictive model.",
    noTransactionsFoundPeriod: "No transactions found in the selected period. Add income and expenses to get personalised insights.",
    runningAi: "Running Deep AI Analysis...",
    crunchingData: "Crunching your financial data 🧠",
    intelligenceEngine: "Smart Financial Intelligence System",
    engineDescription: "Our distributed ML fleet analyses raw categorical metadata across your income vectors and expense horizons to optimize your net worth progression.",

    // Settings
    changeLanguage: "Change Language",
    appTheme: "Application Theme",
    securityLogin: "Security & Login",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    sendOtp: "Send OTP to",
    verifyChange: "Verify & Change",
    cancel: "Cancel",
    themeLight: "Default Light",
    themeDark: "Sunset Light",
    themeMidnight: "Midnight Royal",
    themeForest: "Forest Emerald",
    themeCyberpunk: "Cyberpunk Sunset",
    themeMint: "Mint Breeze",

    // Profiles
    username: "Username",
    email: "Email",
    saveProfile: "Save Profile",

    // Categories
    cat_food: "Food",
    cat_groceries: "Groceries",
    cat_healthcare: "Healthcare",
    cat_education: "Education",
    cat_rent: "Rent",
    cat_utilities: "Utilities",
    cat_entertainment: "Entertainment",
    cat_transportation: "Transportation",
    cat_other: "Other",
    cat_travel: "Travel",
    cat_shopping: "Shopping",
    cat_bills: "Bills",
    cat_others: "Others",
    cat_salary: "Salary",
    cat_gift: "Gift",
    cat_loan: "Loan",
    cat_freelance: "Freelance",
    cat_investment: "Investment",

    // Risk levels
    risk_safe: "Safe",
    risk_warning: "Warning",
    risk_critical: "Critical",
    risk_unknown: "Unknown",

    // Months
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",

    // Login & Forgot Password
    forgotPasswordTitle: "Forgot Password",
    stepLabel: "Step",
    stepOf: "of",
    enterEmailStep: "Enter Your Email",
    enterOtpStep: "Enter OTP",
    setNewPasswordStep: "Set New Password",
    emailPlaceholder: "Your registered email address",
    sendOtpBtn: "Send OTP",
    sendingBtn: "Sending…",
    otpSentTo: "OTP sent to",
    otpPlaceholder: "000000",
    verifyOtpBtn: "Verify OTP",
    verifyingBtn: "Verifying…",
    resendOtpBtn: "Resend OTP",
    newPasswordPlaceholder: "New Password (min. 6 characters)",
    confirmPasswordPlaceholder: "Confirm New Password",
    resetPasswordBtn: "Reset Password",
    resettingBtn: "Resetting…",
    backToLoginBtn: "← Back to Login",
    welcomeTo: "Welcome to",
    smartFinancial: "Smart Financial",
    intelligenceSystemText: "Intelligence System",
    aiInsightsFuture: "AI-powered insights for your financial future",
    createAccountTitle: "Create Account",
    signInTitle: "Sign In",
    usernamePlaceholder: "Username",
    emailInputPlaceholder: "Email",
    passwordPlaceholder: "Password",
    forgotPasswordLink: "Forgot Password?",
    signUpBtn: "Sign Up",
    loginBtn: "Login",
    creatingAccountBtn: "Creating Account…",
    pleaseWaitBtn: "Please wait…",
    alreadyHaveAccountLink: "Already have an account? Login",
    dontHaveAccountLink: "Don't have an account? Create one",
    fillAllFieldsError: "Please fill in all fields.",
    accountCreatedSuccess: "Account created! Please log in.",
    signupFailedError: "Signup failed. Try again.",
    waitLoggingInInfo: "Please wait while we log you in…",
    invalidEmailPasswordError: "Invalid email or password.",
    cannotConnectServerError: "Cannot connect to server. Please try again.",
    passwordsDoNotMatchError: "New passwords do not match!",
    pwdMinLengthError: "New password must be at least 6 characters.",
    noEmailFoundError: "No registered email found. Please update your profile first.",
    otpSentSuccess: "OTP sent. Check your inbox.",
    otpSendFailError: "Failed to send OTP email. Check server logs.",
    invalidOtpError: "Invalid OTP. Please check your email.",
    pwdResetSuccess: "Password reset successful! Redirecting to login…",
    pwdResetFailError: "Failed to reset password.",

    // Dashboard & Profile
    userProfileTitle: "User Profile",
    enterUsernameLabel: "Enter the Username",
    enterEmailLabel: "Enter the Email ID",
    emailIdLabel: "Email ID",
    enterMobileLabel: "Enter the Mobile Number",
    mobileNumberLabel: "Mobile Number",
    saveDetailsBtn: "Save Details",
    editProfileBtn: "Edit Profile",
    profileSavedSuccess: "Login Successful ! Redirecting... ",
    profileSaveFailError: "Failed to save profile.",
    profileSaveError: "Error saving profile.",
    invalidAmountError: "Please enter a valid amount.",
    selectDateError: "Please select a date.",
    incomeAddedSuccess: "Income added successfully!",
    incomeDeleteSuccess: "Income record deleted.",
    expenseAddedSuccess: "Expense added successfully!",
    expenseDeleteSuccess: "Expense record deleted."
  },
  hi: {
    // Nav & Sidebar
    dashboard: "डैशबोर्ड सिंहावलोकन",
    expenses: "व्यय प्रबंधक",
    income: "आय प्रबंधक",
    analytics: "वित्तीय विश्लेषण",
    predictions: "एआई भविष्यवाणियां",
    settings: "सेटिंग्स",
    profile: "प्रोफ़ाइल सेटिंग्स",
    logout: "लॉगआउट",
    welcome: "स्वागत है",
    
    // Dashboard
    totalIncome: "कुल आय",
    totalExpenses: "कुल खर्च",
    savings: "बचत",
    dailySafeBudget: "दैनिक सुरक्षित बजट",
    nextDays: "आने वाले दिन",
    smartAlerts: "स्मार्ट अलर्ट",
    recentActivity: "हाल ही की गतिविधि",
    expenseBreakdown: "खर्चों का विवरण",
    noTransactions: "स्वचालित बुद्धिमत्ता अंतर्दृष्टि की गणना करने के लिए अपना पहला आय और व्यय विवरण दर्ज करें!",
    noRecentActivity: "यहाँ कोई हालिया लेनदेन दर्ज नहीं है।",
    noExpensesMonth: "इस महीने कोई खर्च दर्ज नहीं किया गया।",
    alertExpensesOutpaced: "⚠️ चेतावनी: इस अवधि के लिए आपके खर्च आपकी कमाई से ₹{amount} अधिक हो गए!",
    alertSavingsSuccess: "✨ बढ़िया काम! आप अपनी कुल आय का {percent}% बचाने में सफल रहे।",
    alertSafeHeadroom: "ऐतिहासिक खर्च की आदतों के आधार पर, आपका दैनिक सुरक्षित बजट ₹{amount} है।",
    
    // Expense / Income Managers
    addExpense: "नया खर्च जोड़ें",
    addIncome: "नया आय स्रोत जोड़ें",
    amountPlaceholder: "राशि ₹",
    specifyCategory: "श्रेणी निर्दिष्ट करें",
    specifyType: "प्रकार निर्दिष्ट करें",
    addButton: "जोड़ें",
    ledgerExpense: "व्यय बही",
    ledgerIncome: "आय बही",
    dateCol: "तारीख",
    categoryCol: "श्रेणी",
    amountCol: "राशि",
    actionCol: "कार्रवाई",
    deleteButton: "हटाएं",
    noExpensesFound: "इस महीने के लिए कोई खर्च रिकॉर्ड नहीं मिला।",
    noIncomeFound: "इस महीने के लिए कोई आय रिकॉर्ड नहीं मिला।",
    
    // Analytics
    downloadCSV: "सीएसवी रिपोर्ट डाउनलोड करें",
    downloadPDF: "पीडीएफ चार्ट डाउनलोड करें",
    selectAnalysisPeriod: "विश्लेषण अवधि चुनें",
    monthWeekView: "🗓️ माह/सप्ताह दृश्य",
    customRange: "🔍 कस्टम अवधि",
    yearLabel: "वर्ष",
    monthLabel: "महीना",
    weekTracker: "सप्ताह ट्रैकर",
    fullMonthView: "पूर्ण माह दृश्य",
    runAnalysis: "⚡ विश्लेषण चलाएं",
    fromLabel: "से",
    toLabel: "तक",
    expensesSelection: "चयनित खर्च",
    savingsRemaining: "बचत (शेष)",
    expenseVsSavingsChart: "व्यय श्रेणियां बनाम बचत",
    dailyBreakdownChart: "दैनिक विवरण (स्टैक्ड)",
    trendChart: "बचत (हरा) बनाम व्यय (लाल) रुझान",
    loadingAnalysis: "कस्टम विश्लेषण चल रहा है...",
    selectRangePrompt: "एक तिथि सीमा चुनें और विश्लेषण चलाएं पर क्लिक करें",
    
    // Predictions
    aiTitle: "🤖 एआई वित्तीय बुद्धिमत्ता",
    periodIncome: "अवधि आय",
    periodExpense: "अवधि व्यय",
    transactionsCount: "लेनदेन",
    nextMonthForecast: "अगले महीने का पूर्वानुमान",
    predictedSavings: "अनुमानित बचत",
    aiInsight: "एआई अंतर्दृष्टि",
    financialDeepDive: "📊 वित्तीय गहन विश्लेषण",
    strategicRecommendations: "रणनीतिक सिफारिशें",
    aiOffline: "एआई इंजन ऑफ़लाइन है — अंतर्निहित भविष्य कहनेवाला मॉडल का उपयोग कर रहे हैं।",
    noTransactionsFoundPeriod: "चयनित अवधि में कोई लेनदेन नहीं मिला। व्यक्तिगत अंतर्दृष्टि प्राप्त करने के लिए आय और व्यय जोड़ें।",
    runningAi: "गहन एआई विश्लेषण चल रहा है...",
    crunchingData: "आपके वित्तीय डेटा का विश्लेषण किया जा रहा है 🧠",
    intelligenceEngine: "वित्तीय बुद्धिमत्ता इंजन",
    engineDescription: "हमारा वितरित एमएल बेड़ा आपकी शुद्ध मूल्य प्रगति को अनुकूलित करने के लिए आपके आय वेक्टर और व्यय क्षितिज में कच्चे श्रेणीबद्ध मेटाडेटा का विश्लेषण करता है।",

    // Settings
    changeLanguage: "भाषा बदलें",
    appTheme: "एप्लिकेशन थीम",
    securityLogin: "सुरक्षा और लॉगिन",
    currentPassword: "वर्तमान पासवर्ड",
    newPassword: "नया पासवर्ड",
    confirmNewPassword: "नए पासवर्ड की पुष्टि करें",
    sendOtp: "ओटीपी भेजें",
    verifyChange: "सत्यापित करें और बदलें",
    cancel: "रद्द करें",
    themeLight: "डिफ़ॉल्ट लाइट",
    themeDark: "सनसेट लाइट",
    themeMidnight: "मिडनाइट रॉयल",
    themeForest: "फॉरेस्ट एमराल्ड",
    themeCyberpunk: "साइबरपंक सनसेट",
    themeMint: "मिंट ब्रीज़",

    // Profiles
    username: "उपयोगकर्ता नाम",
    email: "ईमेल",
    saveProfile: "प्रोफ़ाइल सहेजें",

    // Categories
    cat_food: "भोजन",
    cat_groceries: "किराना",
    cat_healthcare: "स्वास्थ्य सेवा",
    cat_education: "शिक्षा",
    cat_rent: "किराया",
    cat_utilities: "उपयोगिताएँ",
    cat_entertainment: "मनोरंजन",
    cat_transportation: "यातायात",
    cat_other: "अन्य",
    cat_travel: "यात्रा",
    cat_shopping: "खरीदारी",
    cat_bills: "बिल",
    cat_others: "अन्य",
    cat_salary: "वेतन",
    cat_gift: "उपहार",
    cat_loan: "ऋण",
    cat_freelance: "फ्रीलांस",
    cat_investment: "निवेश",

    // Risk levels
    risk_safe: "सुरक्षित",
    risk_warning: "चेतावनी",
    risk_critical: "गंभीर",
    risk_unknown: "अज्ञात",

    // Months
    january: "जनवरी",
    february: "फरवरी",
    march: "मार्च",
    april: "अप्रैल",
    may: "मई",
    june: "जून",
    july: "जुलाई",
    august: "अगस्त",
    september: "सितंबर",
    october: "अक्टूबर",
    november: "नवंबर",
    december: "दिसंबर",

    // Login & Forgot Password
    forgotPasswordTitle: "पासवर्ड भूल गए",
    stepLabel: "चरण",
    stepOf: "का",
    enterEmailStep: "अपना ईमेल दर्ज करें",
    enterOtpStep: "ओटीपी दर्ज करें",
    setNewPasswordStep: "नया पासवर्ड सेट करें",
    emailPlaceholder: "आपका पंजीकृत ईमेल पता",
    sendOtpBtn: "ओटीपी भेजें",
    sendingBtn: "भेजा जा रहा है…",
    otpSentTo: "ओटीपी भेजा गया",
    otpPlaceholder: "000000",
    verifyOtpBtn: "ओटीपी सत्यापित करें",
    verifyingBtn: "सत्यापन किया जा रहा है…",
    resendOtpBtn: "ओटीपी पुनः भेजें",
    newPasswordPlaceholder: "नया पासवर्ड (न्यूनतम 6 अक्षर)",
    confirmPasswordPlaceholder: "नए पासवर्ड की पुष्टि करें",
    resetPasswordBtn: "पासवर्ड रीसेट करें",
    resettingBtn: "रीसेट किया जा रहा है…",
    backToLoginBtn: "← लॉगिन पर वापस जाएं",
    welcomeTo: "आपका स्वागत है",
    smartFinancial: "स्मार्ट वित्तीय",
    intelligenceSystemText: "बुद्धिमत्ता प्रणाली",
    aiInsightsFuture: "आपके वित्तीय भविष्य के लिए एआई-संचालित अंतर्दृष्टि",
    createAccountTitle: "खाता बनाएं",
    signInTitle: "साइन इन करें",
    usernamePlaceholder: "उपयोगकर्ता नाम",
    emailInputPlaceholder: "ईमेल",
    passwordPlaceholder: "पासवर्ड",
    forgotPasswordLink: "पासवर्ड भूल गए?",
    signUpBtn: "साइन अप करें",
    loginBtn: "लॉगिन",
    creatingAccountBtn: "खाता बनाया जा रहा है…",
    pleaseWaitBtn: "कृपया प्रतीक्षा करें…",
    alreadyHaveAccountLink: "पहले से ही एक खाता है? लॉगिन करें",
    dontHaveAccountLink: "खाता नहीं है? एक बनाएं",
    fillAllFieldsError: "कृपया सभी क्षेत्रों को भरें।",
    accountCreatedSuccess: "खाता बन गया! कृपया लॉगिन करें।",
    signupFailedError: "साइनअप विफल रहा। पुनः प्रयास करें।",
    waitLoggingInInfo: "कृपया प्रतीक्षा करें, हम आपको लॉगिन कर रहे हैं…",
    invalidEmailPasswordError: "अमान्य ईमेल या पासवर्ड।",
    cannotConnectServerError: "सर्वर से कनेक्ट नहीं हो पा रहा है। कृपया पुनः प्रयास करें।",
    passwordsDoNotMatchError: "नए पासवर्ड मेल नहीं खाते!",
    pwdMinLengthError: "नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
    noEmailFoundError: "कोई पंजीकृत ईमेल नहीं मिला। कृपया पहले अपनी प्रोफ़ाइल अपडेट करें।",
    otpSentSuccess: "ओटीपी भेज दिया गया है। अपना इनबॉक्स जांचें।",
    otpSendFailError: "ओटीपी ईमेल भेजने में विफल। सर्वर लॉग जांचें।",
    invalidOtpError: "अमान्य ओटीपी। कृपया अपना ईमेल जांचें।",
    pwdResetSuccess: "पासवर्ड रीसेट सफल! लॉगिन पर पुनर्निर्देशित किया जा रहा है…",
    pwdResetFailError: "पासवर्ड रीसेट करने में विफल।",

    // Dashboard & Profile
    userProfileTitle: "उपयोगकर्ता प्रोफ़ाइल",
    enterUsernameLabel: "उपयोगकर्ता नाम दर्ज करें",
    enterEmailLabel: "ईमेल आईडी दर्ज करें",
    emailIdLabel: "ईमेल आईडी",
    enterMobileLabel: "मोबाइल नंबर दर्ज करें",
    mobileNumberLabel: "मोबाइल नंबर",
    saveDetailsBtn: "विवरण सहेजें",
    editProfileBtn: "प्रोफ़ाइल संपादित करें",
    profileSavedSuccess: "प्रोफ़ाइल सफलतापूर्वक सहेजी गई!",
    profileSaveFailError: "प्रोफ़ाइल सहेजने में विफल।",
    profileSaveError: "प्रोफ़ाइल सहेजने में त्रुटि।",
    invalidAmountError: "कृपया एक मान्य राशि दर्ज करें।",
    selectDateError: "कृपया एक तारीख चुनें।",
    incomeAddedSuccess: "आय सफलतापूर्वक जोड़ी गई!",
    incomeDeleteSuccess: "आय रिकॉर्ड हटा दिया गया।",
    expenseAddedSuccess: "व्यय सफलतापूर्वक जोड़ा गया!",
    expenseDeleteSuccess: "व्यय रिकॉर्ड हटा दिया गया।"
  },
  ta: {
    // Nav & Sidebar
    dashboard: "டாஷ்போர்டு மேலோட்டம்",
    expenses: "செலவு மேலாளர்",
    income: "வருமான மேலாளர்",
    analytics: "நிதி பகுப்பாய்வு",
    predictions: "AI கணிப்புகள்",
    settings: "அமைப்புகள்",
    profile: "சுயவிவர அமைப்புகள்",
    logout: "வெளியேறு",
    welcome: "வரவேற்கிறோம்",
    
    // Dashboard
    totalIncome: "மொத்த வருமானம்",
    totalExpenses: "மொத்த செலவுகள்",
    savings: "சேமிப்பு",
    dailySafeBudget: "தினசரி பாதுகாப்பான பட்ஜெட்",
    nextDays: "அடுத்த நாட்கள்",
    smartAlerts: "ஸ்மார்ட் எச்சரிக்கைகள்",
    recentActivity: "சமீபத்திய நடவடிக்கை",
    expenseBreakdown: "செலவு முறிவு",
    noTransactions: "தானியங்கி நுண்ணறிவு நுண்ணறிவுகளைக் கணக்கிட உங்கள் முதல் வருமானம் மற்றும் செலவு விவரங்களை பதிவு செய்யவும்!",
    noRecentActivity: "சமீபத்திய பரிவர்த்தனைகள் எதுவும் இங்கு பதிவு செய்யப்படவில்லை.",
    noExpensesMonth: "இந்த மாதம் செலவுகள் எதுவும் பதிவு செய்யப்படவில்லை.",
    alertExpensesOutpaced: "⚠️ எச்சரிக்கை: இந்த காலத்தில் உங்கள் செலவுகள் உங்கள் வருமானத்தை விட ₹{amount} அதிகமாகிவிட்டது!",
    alertSavingsSuccess: "✨ அருமை! உங்கள் மொத்த வருமானத்தில் {percent}% ஐ நீங்கள் சேமித்துள்ளீர்கள்.",
    alertSafeHeadroom: "வரலாற்று செலவு பழக்கவழக்கங்களின் அடிப்படையில், உங்கள் தினசரி பாதுகாப்பான பட்ஜெட் ₹{amount} ஆகும்.",
    
    // Expense / Income Managers
    addExpense: "செலவு பதிவைச் சேர்",
    addIncome: "வருமான ஆதாரத்தைச் சேர்",
    amountPlaceholder: "தொகை ₹",
    specifyCategory: "வகையைக் குறிப்பிடவும்",
    specifyType: "வகையைத் தேர்ந்தெடுக்கவும்",
    addButton: "சேர்",
    ledgerExpense: "செலவு பேரேடு",
    ledgerIncome: "வருமான பேரேடு",
    dateCol: "தேதி",
    categoryCol: "வகை",
    amountCol: "தொகை",
    actionCol: "நடவடிக்கை",
    deleteButton: "நீக்கு",
    noExpensesFound: "இந்த மாதத்திற்கான செலவுப் பதிவுகள் எதுவும் இல்லை.",
    noIncomeFound: "இந்த மாதத்திற்கான வருமானப் பதிவுகள் எதுவும் இல்லை.",
    
    // Analytics
    downloadCSV: "CSV அறிக்கையை பதிவிறக்கு",
    downloadPDF: "PDF விளக்கப்படங்களை பதிவிறக்கு",
    selectAnalysisPeriod: "பகுப்பாய்வு காலத்தைத் தேர்ந்தெடுக்கவும்",
    monthWeekView: "🗓️ மாதம்/வாரம் காட்சி",
    customRange: "🔍 தனிப்பயன் வரம்பு",
    yearLabel: "வருடம்",
    monthLabel: "மாதம்",
    weekTracker: "வாரம் டிராக்கர்",
    fullMonthView: "முழு மாத காட்சி",
    runAnalysis: "⚡ பகுப்பாய்வை இயக்கு",
    fromLabel: "இருந்து",
    toLabel: "வரை",
    expensesSelection: "தேர்ந்தெடுக்கப்பட்ட செலவுகள்",
    savingsRemaining: "சேமிப்பு (மீதமுள்ளவை)",
    expenseVsSavingsChart: "செலவு வகைகள் மற்றும் சேமிப்பு",
    dailyBreakdownChart: "தினசரி முறிவு (அடுக்கப்பட்ட)",
    trendChart: "சேமிப்பு (பச்சை) மற்றும் செலவுகள் (சிவப்பு) போக்கு",
    loadingAnalysis: "தனிப்பயன் பகுப்பாய்வு இயங்குகிறது...",
    selectRangePrompt: "தேதி வரம்பைத் தேர்ந்தெடுத்து பகுப்பாய்வை இயக்கு என்பதை அழுத்தவும்",
    
    // Predictions
    aiTitle: "🤖 AI நிதி நுண்ணறிவும்",
    periodIncome: "கால வருமானம்",
    periodExpense: "கால செலவு",
    transactionsCount: "பரிவர்த்தனைகள்",
    nextMonthForecast: "அடுத்த மாத கணிப்பு",
    predictedSavings: "கணிக்கப்பட்ட சேமிப்பு",
    aiInsight: "AI நுண்ணறிவு",
    financialDeepDive: "📊 விரிவான நிதி பகுப்பாய்வு",
    strategicRecommendations: "மூலோபாய பரிந்துரைகள்",
    aiOffline: "AI எஞ்சின் ஆஃப்லைனில் உள்ளது — உள்ளமைக்கப்பட்ட முன்கணிப்பு மாதிரியைப் பயன்படுத்துகிறது.",
    noTransactionsFoundPeriod: "தேர்ந்தெடுக்கப்பட்ட காலத்தில் பரிவர்த்தனைகள் எதுவும் இல்லை. தனிப்பயனாக்கப்பட்ட நுண்ணறிவுகளைப் பெற வருமானம் மற்றும் செலவுகளைச் சேர்க்கவும்.",
    runningAi: "ஆழமான AI பகுப்பாய்வை இயக்குகிறது...",
    crunchingData: "உங்கள் நிதித் தரவை பகுப்பாய்வு செய்கிறது 🧠",
    intelligenceEngine: "நிதி நுண்ணறிவு இயந்திரம்",
    engineDescription: "எங்கள் விநியோகிக்கப்பட்ட ML குழு, உங்கள் நிகர மதிப்பு முன்னேற்றத்தை மேம்படுத்த, உங்கள் வருமான திசையன்கள் மற்றும் செலவு எல்லைகளின் மூல வகைப்பாட்டுத் தரவை பகுப்பாய்வு செய்கிறது.",

    // Settings
    changeLanguage: "மொழியை மாற்றவும்",
    appTheme: "பயன்பாட்டு தீம்",
    securityLogin: "பாதுகாப்பு & உள்நுழைவு",
    currentPassword: "தற்போதைய கடவுச்சொல்",
    newPassword: "புதிய கடவுச்சொல்",
    confirmNewPassword: "புதிய கடவுச்சொல்லை உறுதிப்படுத்து",
    sendOtp: "OTP அனுப்பு",
    verifyChange: "சரிபார்த்து மாற்று",
    cancel: "ரத்து செய்",
    themeLight: "இயல்புநிலை லைட்",
    themeDark: "சன்செட் லைட்",
    themeMidnight: "மிட்நைட் ராயல்",
    themeForest: "பாரஸ்ட் எமரால்டு",
    themeCyberpunk: "சய்பர்பங்க் சன்செட்",
    themeMint: "மின்ட் பிரீஸ்",

    // Profiles
    username: "பயனர் பெயர்",
    email: "மின்னஞ்சல்",
    saveProfile: "சுயவிவரத்தைச் சேமி",

    // Categories
    cat_food: "உணவு",
    cat_groceries: "மளிகை பொருட்கள்",
    cat_healthcare: "சுகாதாரம்",
    cat_education: "கல்வி",
    cat_rent: "வாடகை",
    cat_utilities: "பயன்பாடுகள்",
    cat_entertainment: "பொழுதுபோக்கு",
    cat_transportation: "போக்குவரத்து",
    cat_other: "மற்றவை",
    cat_travel: "பயணம்",
    cat_shopping: "ஷாப்பிங்",
    cat_bills: "பில்கள்",
    cat_others: "மற்றவை",
    cat_salary: "சம்பளம்",
    cat_gift: "பரிசு",
    cat_loan: "கடன்",
    cat_freelance: "ஃப்ரீலான்ஸ்",
    cat_investment: "முதலீடு",

    // Risk levels
    risk_safe: "பாதுகாப்பானது",
    risk_warning: "எச்சரிக்கை",
    risk_critical: "மிகவும் ஆபத்தானது",
    risk_unknown: "அறியப்படாதது",

    // Months
    january: "ஜனவரி",
    february: "பிப்ரவரி",
    march: "மார்ச்",
    april: "ஏப்ரல்",
    may: "மே",
    june: "ஜூன்",
    july: "ஜூலை",
    august: "ஆகஸ்ட்",
    september: "செப்டம்பர்",
    october: "அக்டோபர்",
    november: "நவம்பர்",
    december: "டிசம்பர்",

    // Login & Forgot Password
    forgotPasswordTitle: "கடவுச்சொல் மறந்துவிட்டதா",
    stepLabel: "படி",
    stepOf: "இல்",
    enterEmailStep: "மின்னஞ்சலை உள்ளிடவும்",
    enterOtpStep: "OTP உள்ளிடவும்",
    setNewPasswordStep: "புதிய கடவுச்சொல்லை அமைக்கவும்",
    emailPlaceholder: "பதிவுசெய்யப்பட்ட மின்னஞ்சல் முகவரி",
    sendOtpBtn: "OTP அனுப்பு",
    sendingBtn: "அனுப்பப்படுகிறது…",
    otpSentTo: "OTP அனுப்பப்பட்டது",
    otpPlaceholder: "000000",
    verifyOtpBtn: "OTP சரிபார்",
    verifyingBtn: "சரிபார்க்கப்படுகிறது…",
    resendOtpBtn: "OTP மீண்டும் அனுப்பு",
    newPasswordPlaceholder: "புதிய கடவுச்சொல் (குறைந்தது 6 எழுத்துக்கள்)",
    confirmPasswordPlaceholder: "புதிய கடவுச்சொல்லை உறுதிப்படுத்துக",
    resetPasswordBtn: "கடவுச்சொல்லை மாற்று",
    resettingBtn: "மாற்றப்படுகிறது…",
    backToLoginBtn: "← உள்நுழைவுக்குச் செல்",
    welcomeTo: "வரவேற்கிறோம்",
    smartFinancial: "ஸ்மார்ட் நிதி",
    intelligenceSystemText: "நுண்ணறிவு அமைப்பு",
    aiInsightsFuture: "உங்கள் நிதி எதிர்காலத்திற்கான AI-ஆற்றல் நுண்ணறிவுகள்",
    createAccountTitle: "கணக்கை உருவாக்கு",
    signInTitle: "உள்நுழைக",
    usernamePlaceholder: "பயனர் பெயர்",
    emailInputPlaceholder: "மின்னஞ்சல்",
    passwordPlaceholder: "கடவுச்சொல்",
    forgotPasswordLink: "கடவுச்சொல் மறந்துவிட்டதா?",
    signUpBtn: "பதிவு செய்க",
    loginBtn: "உள்நுழை",
    creatingAccountBtn: "உருவாக்கப்படுகிறது…",
    pleaseWaitBtn: "காத்திருக்கவும்…",
    alreadyHaveAccountLink: "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக",
    dontHaveAccountLink: "கணக்கு இல்லையா? ஒன்றை உருவாக்குங்கள்",
    fillAllFieldsError: "அனைத்து விவரங்களையும் நிரப்பவும்.",
    accountCreatedSuccess: "கணக்கு உருவாக்கப்பட்டது! தயவுசெய்து உள்நுழைக.",
    signupFailedError: "பதிவு செய்ய முடியவில்லை. மீண்டும் முயலவும்.",
    waitLoggingInInfo: "உள்நுழையும் வரை காத்திருக்கவும்…",
    invalidEmailPasswordError: "மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது.",
    cannotConnectServerError: "சேவையகத்துடன் இணைக்க முடியவில்லை. மீண்டும் முயலவும்.",
    passwordsDoNotMatchError: "புதிய கடவுச்சொற்கள் பொருந்தவில்லை!",
    pwdMinLengthError: "புதிய கடவுச்சொல் குறைந்தது 6 எழுத்துக்களைக் கொண்டிருக்க வேண்டும்.",
    noEmailFoundError: "பதிவு செய்யப்பட்ட மின்னஞ்சல் எதுவும் இல்லை. சுயவிவரத்தை மாற்றவும்.",
    otpSentSuccess: "OTP அனுப்பப்பட்டது. உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும்.",
    otpSendFailError: "OTP அனுப்ப முடியவில்லை. சேவையகத்தை சரிபார்க்கவும்.",
    invalidOtpError: "தவறான OTP. உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும்.",
    pwdResetSuccess: "கடவுச்சொல் மாற்றப்பட்டது! உள்நுழைவுக்குச் செல்லவும்…",
    pwdResetFailError: "கடவுச்சொல்லை மாற்ற முடியவில்லை.",

    // Dashboard & Profile
    userProfileTitle: "பயனர் சுயவிவரம்",
    enterUsernameLabel: "பயனர் பெயரை உள்ளிடவும்",
    enterEmailLabel: "மின்னஞ்சலை உள்ளிடவும்",
    emailIdLabel: "மின்னஞ்சல் முகவரி",
    enterMobileLabel: "கைபேசி எண்ணை உள்ளிடவும்",
    mobileNumberLabel: "கைபேசி எண்",
    saveDetailsBtn: "விவரங்களைச் சேமி",
    editProfileBtn: "சுயவிவரத்தைத் திருத்து",
    profileSavedSuccess: "சுயவிவரம் சேமிக்கப்பட்டது!",
    profileSaveFailError: "சுயவிவரத்தைச் சேமிக்க முடியவில்லை.",
    profileSaveError: "சுயவிவரத்தைச் சேமிப்பதில் பிழை.",
    invalidAmountError: "தயவுசெய்து சரியான தொகையை உள்ளிடவும்.",
    selectDateError: "தயவுசெய்து தேதியைத் தேர்ந்தெடுக்கவும்.",
    incomeAddedSuccess: "வருமானம் வெற்றிகரமாக சேர்க்கப்பட்டது!",
    incomeDeleteSuccess: "வருமான பதிவு நீக்கப்பட்டது.",
    expenseAddedSuccess: "செலவு வெற்றிகரமாக சேர்க்கப்பட்டது!",
    expenseDeleteSuccess: "செலவு பதிவு நீக்கப்பட்டது."
  },
};

const LanguageContext = createContext();
const ThemeContext = createContext();

export function AppContextProvider({ children }) {
  // ── Language Setup ──
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("app_language") || "en";
  });

  const setLanguage = (lang) => {
    localStorage.setItem("app_language", lang);
    setLanguageState(lang);
  };

  const t = (key) => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  // ── Theme Setup ──
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("app_theme") || "light";
  });

  const setTheme = (newTheme) => {
    localStorage.setItem("app_theme", newTheme);
    setThemeState(newTheme);
  };

  // Apply theme class to document element AND body on theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    const themes = ["light", "dark", "midnight", "forest", "cyberpunk", "mint"];
    // Remove all previous theme classes
    themes.forEach(t => {
      root.classList.remove(`theme-${t}`);
      body.classList.remove(`theme-${t}`);
    });
    // Add new theme class
    root.classList.add(`theme-${theme}`);
    body.classList.add(`theme-${theme}`);
  }, [theme]);

  // Chart-specific color tokens (recharts needs JS values, CSS can't reach SVG fill/stroke)
  const CHART_THEMES = {
    light:     { grid: "#e2e8f0", axis: "#64748b",  tooltipBg: "#ffffff", tooltipBorder: "#e2e8f0", legend: "#374151",  cartesian: "#e2e8f0", textColor: "#64748b", tooltipColor: "#1f2937", gridColor: "#e2e8f0" },
    dark:      { grid: "#334155", axis: "#94a3b8",  tooltipBg: "#1e293b", tooltipBorder: "#334155", legend: "#cbd5e1",  cartesian: "#334155", textColor: "#94a3b8", tooltipColor: "#f1f5f9", gridColor: "#334155" },
    midnight:  { grid: "#2d4060", axis: "#8da9c4",  tooltipBg: "#1c2541", tooltipBorder: "#3a506b", legend: "#b8d0e8",  cartesian: "#2d4060", textColor: "#8da9c4", tooltipColor: "#dbeafe", gridColor: "#2d4060" },
    forest:    { grid: "#2b5c35", axis: "#a7f3d0",  tooltipBg: "#19381f", tooltipBorder: "#2b5c35", legend: "#d1fae5",  cartesian: "#2b5c35", textColor: "#a7f3d0", tooltipColor: "#d1fae5", gridColor: "#2b5c35" },
    cyberpunk: { grid: "#3f007f", axis: "#c084fc",  tooltipBg: "#1a0050", tooltipBorder: "#3f007f", legend: "#e9d5ff",  cartesian: "#3f007f", textColor: "#c084fc", tooltipColor: "#f5d0fe", gridColor: "#3f007f" },
  };
  const chartTheme = CHART_THEMES[theme] || CHART_THEMES.light;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <ThemeContext.Provider value={{ theme, setTheme, chartTheme }}>
        {children}
      </ThemeContext.Provider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useChartTheme() {
  const { chartTheme } = useContext(ThemeContext);
  return chartTheme;
}
