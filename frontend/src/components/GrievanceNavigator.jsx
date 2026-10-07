import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import confetti from "canvas-confetti";
import {
  Mic,
  Send,
  AlertCircle,
  FileText,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  Square,
  User,
  MapPin,
  Phone,
  FileEdit,
} from "lucide-react";

const UI_TEXT = {
  en: {
    heroTitle: "How can we help you?",
    heroSubtitle: "Tell us your problem. We'll guide you to the right place.",
    inputPlaceholder: "Type or speak your problem...",
    actionReportTitle: "Report a Problem",
    actionReportDesc: "Tell us your issue",
    actionDocTitle: "Understand a Document",
    actionDocDesc: "Upload a bill or notice",
    actionTrackTitle: "Track a Complaint",
    actionTrackDesc: "Check your complaint status",
    listening: "Listening live...",
    recordingAudio: "Recording speech",
    clickToStop: "Click mic to stop",
    send: "Send",
    fileTicket: "Proceed to File Grievance",
    filing: "Registering official complaint...",
    analyzing: "Finding the right department & guidance...",
    askAnother: "Ask another question",
    assignedAuthority: "Assigned Municipal Authority",
    resolutionSla: "Right to Service SLA",
    authority: "Authority",
    helpline: "Helpline",
    legalAdviceTitle: "Legal & Redressal Advice",
    officiallyFiled: "Grievance Officially Filed",
    copy: "Copy",
    copied: "Copied",
    department: "Department",
    targetResolution: "Target Resolution",
    targetDate: "Target Date",
    trackStatusBtn: "Track Complaint Status",
    promptLang: "Supports Hindi, Punjabi, and English",
    // Step 3: Citizen Details
    detailsTitle: "Citizen Contact & Location Details",
    detailsSubtitle: "Please provide your details so municipal officers can inspect and resolve your issue.",
    nameLabel: "Citizen Full Name",
    namePlaceholder: "e.g. Virender Sharma",
    addressLabel: "Relevant Location / Address in Chandigarh",
    addressPlaceholder: "e.g. House No. 1240, Sector 22-B, Chandigarh",
    phoneLabel: "Contact Phone (Optional)",
    phonePlaceholder: "e.g. 98765-43210",
    reviewBtn: "Review & Confirm",
    backToGuidance: "Back to Guidance",
    nameRequiredError: "Please enter your full name and relevant location/address.",
    // Step 4: Confirmation
    confirmTitle: "Confirm Grievance Details",
    confirmSubtitle: "Please review the summary below before registering your official complaint.",
    citizenSummary: "Citizen Name",
    locationSummary: "Location / Address",
    phoneSummary: "Phone Number",
    deptSummary: "Assigned Department",
    slaSummary: "Mandatory SLA",
    problemSummary: "Grievance Description",
    confirmAndFileBtn: "Confirm & File Official Complaint",
    editDetailsBtn: "Edit Details",
  },
  hi: {
    heroTitle: "हम आपकी क्या सहायता कर सकते हैं?",
    heroSubtitle: "अपनी समस्या बताएं। हम आपको सही विभाग तक पहुंचाएंगे।",
    inputPlaceholder: "अपनी समस्या लिखें या बोलें...",
    actionReportTitle: "समस्या दर्ज करें",
    actionReportDesc: "अपनी समस्या बताएं",
    actionDocTitle: "दस्तावेज़ समझें",
    actionDocDesc: "बिल या नोटिस अपलोड करें",
    actionTrackTitle: "शिकायत ट्रैक करें",
    actionTrackDesc: "अपनी शिकायत की स्थिति जांचें",
    listening: "सुन रहे हैं... बोलिए",
    recordingAudio: "आवाज रिकॉर्ड हो रही है",
    clickToStop: "रोकने के लिए माइक पर क्लिक करें",
    send: "भेजें",
    fileTicket: "शिकायत दर्ज करने के लिए आगे बढ़ें",
    filing: "शिकायत दर्ज की जा रही है...",
    analyzing: "उचित विभाग एवं नियम जांचे जा रहे हैं...",
    askAnother: "दूसरी समस्या बताएं",
    assignedAuthority: "संबंधित नगर निगम प्राधिकरण",
    resolutionSla: "सेवा का अधिकार समय-सीमा (SLA)",
    authority: "प्राधिकरण",
    helpline: "हेल्पलाइन",
    legalAdviceTitle: "कानूनी एवं निवारण प्रक्रिया",
    officiallyFiled: "शिकायत आधिकारिक तौर पर दर्ज हुई",
    copy: "कॉपी",
    copied: "कॉपी हुआ",
    department: "विभाग",
    targetResolution: "निवारण समय",
    targetDate: "अंतिम तिथि",
    trackStatusBtn: "शिकायत की स्थिति ट्रैक करें",
    promptLang: "हिंदी, पंजाबी या अंग्रेजी में बोलें या लिखें",
    // Step 3: Citizen Details
    detailsTitle: "नागरिक विवरण एवं समस्या का स्थान",
    detailsSubtitle: "कृपया अपना विवरण दर्ज करें ताकि संबंधित अधिकारी स्थल पर आकर समस्या का समाधान कर सकें।",
    nameLabel: "नागरिक का पूरा नाम",
    namePlaceholder: "उदा. वीरेंद्र शर्मा",
    addressLabel: "स्थान / पता (चंडीगढ़)",
    addressPlaceholder: "उदा. मकान नं. 1240, सेक्टर 22-बी, चंडीगढ़",
    phoneLabel: "मोबाइल नंबर (वैकल्पिक)",
    phonePlaceholder: "उदा. 98765-43210",
    reviewBtn: "विवरण की पुष्टि करें",
    backToGuidance: "वापस जाएं",
    nameRequiredError: "कृपया अपना नाम और समस्या का स्थान/पता अवश्य भरें।",
    // Step 4: Confirmation
    confirmTitle: "शिकायत विवरण की पुष्टि करें",
    confirmSubtitle: "आधिकारिक शिकायत दर्ज करने से पहले कृपया नीचे दी गई जानकारी की जांच कर लें।",
    citizenSummary: "नागरिक का नाम",
    locationSummary: "स्थान / पता",
    phoneSummary: "मोबाइल नंबर",
    deptSummary: "संबंधित विभाग",
    slaSummary: "कानूनी समय-सीमा (SLA)",
    problemSummary: "शिकायत का विवरण",
    confirmAndFileBtn: "पुष्टि करें और शिकायत दर्ज करें",
    editDetailsBtn: "विवरण बदलें",
  },
  pa: {
    heroTitle: "ਅਸੀਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੇ ਹਾਂ?",
    heroSubtitle: "ਆਪਣੀ ਸਮੱਸਿਆ ਦੱਸੋ। ਅਸੀਂ ਤੁਹਾਨੂੰ ਸਹੀ ਵਿਭਾਗ ਤੱਕ ਪਹੁੰਚਾਵਾਂਗੇ।",
    inputPlaceholder: "ਆਪਣੀ ਸਮੱਸਿਆ ਲਿਖੋ ਜਾਂ ਬੋਲੋ...",
    actionReportTitle: "ਸਮੱਸਿਆ ਦਰਜ ਕਰੋ",
    actionReportDesc: "ਆਪਣੀ ਸਮੱਸਿਆ ਦੱਸੋ",
    actionDocTitle: "ਦਸਤਾਵੇਜ਼ ਸਮਝੋ",
    actionDocDesc: "ਬਿੱਲ ਜਾਂ ਨੋਟਿਸ ਅਪਲੋਡ ਕਰੋ",
    actionTrackTitle: "ਸ਼ਿਕਾਇਤ ਟਰੈਕ ਕਰੋ",
    actionTrackDesc: "ਆਪਣੀ ਸ਼ਿਕਾਇਤ ਦੀ ਸਥਿਤੀ ਦੇਖੋ",
    listening: "ਸੁਣ ਰਹੇ ਹਾਂ... ਬੋਲੋ",
    recordingAudio: "ਆਵਾਜ਼ ਰਿਕਾਰਡ ਹੋ ਰਹੀ ਹੈ",
    clickToStop: "ਰੋਕਣ ਲਈ ਮਾਈਕ 'ਤੇ ਕਲਿੱਕ ਕਰੋ",
    send: "ਭੇਜੋ",
    fileTicket: "ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰਨ ਲਈ ਅੱਗੇ ਵਧੋ",
    filing: "ਸ਼ਿਕਾਇਤ ਦਰਜ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...",
    analyzing: "ਸਹੀ ਵਿਭਾਗ ਤੇ ਨਿਯਮ ਲੱਭੇ ਜਾ ਰਹੇ ਹਨ...",
    askAnother: "ਹੋਰ ਸਮੱਸਿਆ ਪੁੱਛੋ",
    assignedAuthority: "ਸਬੰਧਤ ਨਗਰ ਨਿਗਮ ਅਧਿਕਾਰੀ",
    resolutionSla: "ਸੇਵਾ ਦਾ ਅਧਿਕਾਰ ਸਮਾਂ-ਸੀਮਾ (SLA)",
    authority: "ਅਥਾਰਟੀ",
    helpline: "ਹੈਲਪਲਾਈਨ",
    legalAdviceTitle: "ਕਾਨੂੰਨੀ ਅਤੇ ਨਿਪਟਾਰਾ ਕਾਰਵਾਈ",
    officiallyFiled: "ਸ਼ਿਕਾਇਤ ਅਧਿਕਾਰਤ ਤੌਰ 'ਤੇ ਦਰਜ ਹੋਈ",
    copy: "ਕਾਪੀ",
    copied: "ਕਾਪੀ ਹੋਇਆ",
    department: "ਵਿਭਾਗ",
    targetResolution: "ਨਿਪਟਾਰਾ ਸਮਾਂ",
    targetDate: "ਆਖਰੀ ਮਿਤੀ",
    trackStatusBtn: "ਸ਼ਿਕਾਇਤ ਦੀ ਸਥਿਤੀ ਟਰੈਕ ਕਰੋ",
    promptLang: "ਪੰਜਾਬੀ, ਹਿੰਦੀ ਜਾਂ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਬੋਲੋ ਜਾਂ ਲਿਖੋ",
    // Step 3: Citizen Details
    detailsTitle: "ਨਾਗਰਿਕ ਵੇਰਵੇ ਅਤੇ ਸਮੱਸਿਆ ਵਾਲੀ ਥਾਂ",
    detailsSubtitle: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਵੇਰਵੇ ਦਿਓ ਤਾਂ ਜੋ ਸਬੰਧਤ ਅਧਿਕਾਰੀ ਮੌਕੇ 'ਤੇ ਜਾਂਚ ਕਰਕੇ ਹੱਲ ਕਰ ਸਕਣ।",
    nameLabel: "ਨਾਗਰਿਕ ਦਾ ਪੂਰਾ ਨਾਮ",
    namePlaceholder: "ਜਿਵੇਂ ਕਿ ਵਰਿੰਦਰ ਸ਼ਰਮਾ",
    addressLabel: "ਸਮੱਸਿਆ ਵਾਲਾ ਪਤਾ / ਸੈਕਟਰ (ਚੰਡੀਗੜ੍ਹ)",
    addressPlaceholder: "ਜਿਵੇਂ ਕਿ ਮਕਾਨ ਨੰ. 1240, ਸੈਕਟਰ 22-ਬੀ, ਚੰਡੀਗੜ੍ਹ",
    phoneLabel: "ਮੋਬਾਈਲ ਨੰਬਰ (ਵਿਕਲਪਿਕ)",
    phonePlaceholder: "ਜਿਵੇਂ ਕਿ 98765-43210",
    reviewBtn: "ਵੇਰਵਿਆਂ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    backToGuidance: "ਪਿੱਛੇ ਜਾਓ",
    nameRequiredError: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਨਾਮ ਅਤੇ ਸਮੱਸਿਆ ਦਾ ਪਤਾ ਜ਼ਰੂਰ ਭਰੋ।",
    // Step 4: Confirmation
    confirmTitle: "ਸ਼ਿਕਾਇਤ ਵੇਰਵਿਆਂ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    confirmSubtitle: "ਅਧਿਕਾਰਤ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਹੇਠਾਂ ਦਿੱਤੀ ਜਾਣਕਾਰੀ ਦੀ ਜਾਂਚ ਕਰ ਲਓ।",
    citizenSummary: "ਨਾਗਰਿਕ ਦਾ ਨਾਮ",
    locationSummary: "ਸਥਾਨ / ਪਤਾ",
    phoneSummary: "ਮੋਬਾਈਲ ਨੰਬਰ",
    deptSummary: "ਸਬੰਧਤ ਵਿਭਾਗ",
    slaSummary: "ਕਾਨੂੰਨੀ ਸਮਾਂ-ਸੀਮਾ (SLA)",
    problemSummary: "ਸ਼ਿਕਾਇਤ ਦਾ ਵੇਰਵਾ",
    confirmAndFileBtn: "ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ",
    editDetailsBtn: "ਵੇਰਵੇ ਬਦਲੋ",
  },
};

const LOCALIZED_ADVICE = {
  water: {
    hi: {
      name: "नगर निगम चंडीगढ़ (जल आपूर्ति एवं सीवरेज विंग)",
      advice: "जल आपूर्ति एवं मीटर संबंधी आधिकारिक प्रक्रिया:\n• आपकी शिकायत को नगर निगम चंडीगढ़ के जल आपूर्ति उप-प्रभाग में दर्ज किया जाएगा।\n• पंजाब सेवा का अधिकार अधिनियम 2011 के तहत मीटर निरीक्षण एवं बिल सुधार की समय-सीमा 7 कार्य दिवस है।\n• सहायता एवं पूछताछ: टोल-फ्री 0172-2540200 या किसी भी ई-संपर्क केंद्र पर संपर्क करें।",
    },
    pa: {
      name: "ਮਿਊਂਸੀਪਲ ਕਾਰਪੋਰੇਸ਼ਨ ਚੰਡੀਗੜ੍ਹ (ਜਲ ਸਪਲਾਈ ਅਤੇ ਸੀਵਰੇਜ ਵਿੰਗ)",
      advice: "ਜਲ ਸਪਲਾਈ ਅਤੇ ਮੀਟਰ ਸੰਬੰਧੀ ਅਧਿਕਾਰਤ ਕਾਰਵਾਈ:\n• ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ ਨਗਰ ਨਿਗਮ ਚੰਡੀਗੜ੍ਹ ਦੇ ਸਬੰਧਤ ਉਪ-ਮੰਡਲ ਵਿੱਚ ਦਰਜ ਕੀਤੀ ਜਾਵੇਗੀ।\n• ਪੰਜਾਬ ਰਾਈਟ ਟੂ ਸਰਵਿਸ ਐਕਟ 2011 ਅਧੀਨ ਮੀਟਰ ਜਾਂਚ ਅਤੇ ਬਿੱਲ ਸੁਧਾਰ ਦੀ ਸਮਾਂ-ਸੀਮਾ 7 ਕੰਮਕਾਜੀ ਦਿਨ ਹੈ।\n• ਸਹਾਇਤਾ ਲਈ ਹੈਲਪਲਾਈਨ: 0172-2540200 ਜਾਂ ਈ-ਸੰਪਰਕ ਕੇਂਦਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
    },
  },
  electricity: {
    hi: {
      name: "चंडीगढ़ बिजली वितरण लिमिटेड (CPDL)",
      advice: "बिजली आपूर्ति एवं ट्रांसफार्मर संबंधी आधिकारिक प्रक्रिया:\n• यह शिकायत सीधे संबंधित सब-डिवीजनल ट्रांसफार्मर टीम को भेजी जाएगी।\n• बिजली गुल रहने पर 19121 पर तत्काल फॉल्ट रेजोल्यूशन अनिवार्य है।\n• आपातकालीन हेल्पलाइन: 19121 (24x7 टोल-फ्री)।",
    },
    pa: {
      name: "ਚੰਡੀਗੜ੍ਹ ਬਿਜਲੀ ਵੰਡ ਲਿਮਿਟੇਡ (CPDL)",
      advice: "ਬਿਜਲੀ ਸਪਲਾਈ ਅਤੇ ਟਰਾਂਸਫਾਰਮਰ ਸੰਬੰਧੀ ਕਾਰਵਾਈ:\n• ਸ਼ਿਕਾਇਤ ਸਬੰਧਤ ਸਬ-ਡਵੀਜ਼ਨ ਟਰਾਂਸਫਾਰਮਰ ਟੀਮ ਨੂੰ ਭੇਜੀ ਜਾਵੇਗੀ।\n• ਬਿਜਲੀ ਕੱਟ ਜਾਂ ਨੁਕਸ ਲਈ 19121 'ਤੇ ਤੁਰੰਤ ਕਾਰਵਾਈ ਲਾਜ਼ਮੀ ਹੈ।\n• ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨ: 19121 (24x7 ਟੋਲ-ਫ੍ਰੀ)।",
    },
  },
  roads: {
    hi: {
      name: "नगर निगम चंडीगढ़ (सड़क एवं स्ट्रीट लाइट विंग - B&R)",
      advice: "सड़क मरम्मत एवं स्ट्रीट लाइट संबंधी आधिकारिक प्रक्रिया:\n• बंद स्ट्रीट लाइट एवं गड्ढों की मरम्मत 3 से 7 कार्य दिवसों में पूरी की जाती है।\n• आधिकारिक सहायता: 0172-2787200 / ई-संपर्क 1800-180-1725।",
    },
    pa: {
      name: "ਮਿਊਂਸੀਪਲ ਕਾਰਪੋਰੇਸ਼ਨ (ਸੜਕਾਂ ਅਤੇ ਸਟ੍ਰੀਟ ਲਾਈਟਾਂ ਵਿੰਗ - B&R)",
      advice: "ਸੜਕ ਮੁਰੰਮਤ ਅਤੇ ਸਟ੍ਰੀਟ ਲਾਈਟ ਸੰਬੰਧੀ ਕਾਰਵਾਈ:\n• ਬੰਦ ਸਟ੍ਰੀਟ ਲਾਈਟਾਂ ਅਤੇ ਖੱਡੇ 3 ਤੋਂ 7 ਕੰਮਕਾਜੀ ਦਿਨਾਂ ਵਿੱਚ ਠੀਕ ਕੀਤੇ ਜਾਂਦੇ ਹਨ।\n• ਅਧਿਕਾਰਤ ਹੈਲਪਲਾਈਨ: 0172-2787200 / ਈ-ਸੰਪਰਕ 1800-180-1725।",
    },
  },
  sanitation: {
    hi: {
      name: "स्वास्थ्य चिकित्सा अधिकारी (MOH स्वच्छता एवं कचरा प्रबंधन)",
      advice: "कचरा संग्रहण एवं स्वच्छता संबंधी आधिकारिक प्रक्रिया:\n• डोर-टू-डोर कचरा संग्रहण टिपर न आने पर 24 से 48 घंटे में शिकायत का समाधान किया जाता है।\n• व्हाट्सएप हेल्पलाइन: 99157-62917 | कंट्रोल रूम: 0172-2787200।",
    },
    pa: {
      name: "ਸਿਹਤ ਮੈਡੀਕਲ ਅਫਸਰ (MOH ਸਫਾਈ ਅਤੇ ਕੂੜਾ ਪ੍ਰਬੰਧਨ)",
      advice: "ਕੂੜਾ ਚੁੱਕਣ ਅਤੇ ਸਫਾਈ ਸੰਬੰਧੀ ਕਾਰਵਾਈ:\n• ਡੋਰ-ਟੂ-ਡੋਰ ਕੂੜਾ ਗੱਡੀ ਨਾ ਆਉਣ 'ਤੇ 24 ਤੋਂ 48 ਘੰਟਿਆਂ ਵਿੱਚ ਸ਼ਿਕਾਇਤ ਦਾ ਨਿਪਟਾਰਾ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।\n• ਵਟਸਐਪ ਹੈਲਪਲਾਈਨ: 99157-62917 | ਕੰਟਰੋਲ ਰੂਮ: 0172-2787200।",
    },
  },
  rti: {
    hi: {
      name: "यूटी प्रशासन (सूचना का अधिकार सेल)",
      advice: "आरटीआई संबंधी आधिकारिक प्रक्रिया:\n• जन सूचना अधिकारी को 30 दिनों के भीतर मांगी गई सूचना प्रदान करना अनिवार्य है।\n• हेल्पलाइन: 0172-2740000।",
    },
    pa: {
      name: "ਯੂ.ਟੀ ਪ੍ਰਸ਼ਾਸਨ (ਸੂਚਨਾ ਦਾ ਅਧਿਕਾਰ ਸੈੱਲ)",
      advice: "ਆਰ.ਟੀ.ਆਈ ਸੰਬੰਧੀ ਅਧਿਕਾਰਤ ਕਾਰਵਾਈ:\n• ਲੋਕ ਸੂਚਨਾ ਅਧਿਕਾਰੀ ਵੱਲੋਂ 30 ਦਿਨਾਂ ਦੇ ਅੰਦਰ ਜਾਣਕਾਰੀ ਦੇਣਾ ਲਾਜ਼ਮੀ ਹੈ।\n• ਹੈਲਪਲਾਈਨ: 0172-2740000।",
    },
  },
};

// Client-side Multilingual Routing Normalization Helper
const enrichMultilingualInput = (text) => {
  const isWater = /पानी|जल|मीटर|नल|सीवर|लीक|बिल|paani|jal|leaking|meter|water|ਸਪਲਾਈ|ਪਾਣੀ|ਸੀਵਰੇਜ|ਬਿੱਲ|ਮੀਟਰ/i.test(text);
  const isElectricity = /बिजली|करंट|पावर|लाइट|ट्रांसफार्मर|bijli|transformer|power|voltage|ਬਿਜਲੀ|ਟਰਾਂਸਫਾਰਮਰ|ਲਾਈਟ/i.test(text);
  const isSanitation = /कचरा|कूड़ा|सफाई|डंप|बदबू|tipper|kachra|kooda|garbage|sanitation|waste|ਕੂੜਾ|ਸਫਾਈ/i.test(text);
  const isRoads = /सड़क|गड्ढा|स्ट्रीट लाइट|अंधेरा|पॉथोल|sadak|gaddha|pothole|streetlight|street light|ਸੜਕ|ਸਟ੍ਰੀਟ ਲਾਈਟ/i.test(text);
  const isRti = /आरटीआई|सूचना का अधिकार|जानकारी|rti|suchna|ਆਰਟੀਆਈ/i.test(text);

  let enhancements = [];
  if (isWater) enhancements.push("water supply & inflated meter bill");
  if (isElectricity) enhancements.push("electricity power cut & transformer");
  if (isSanitation) enhancements.push("garbage waste collection sanitation");
  if (isRoads) enhancements.push("road pothole street light maintenance");
  if (isRti) enhancements.push("right to information RTI cell");

  if (enhancements.length > 0) {
    return `${text} [Topic: ${enhancements.join(", ")}]`;
  }
  return text;
};

export default function GrievanceNavigator({
  routingResult,
  setRoutingResult,
  filedResult,
  setFiledResult,
  loading,
  setLoading,
  filingLoading,
  setFilingLoading,
  onNavigateToTracker,
  onNavigateToDocuments,
  language = "en",
}) {
  // Step 1 State: Problem description
  const [customText, setCustomText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [filingError, setFilingError] = useState(null);
  const [detailsError, setDetailsError] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Step 3 State: Citizen Details
  const [citizenName, setCitizenName] = useState("");
  const [citizenAddress, setCitizenAddress] = useState("");
  const [citizenPhone, setCitizenPhone] = useState("");

  // Flow Step: 'input' -> 'classified' -> 'details' -> 'confirm' -> 'filed'
  const [flowStep, setFlowStep] = useState(() => {
    if (filedResult) return "filed";
    if (routingResult) return "classified";
    return "input";
  });

  const textareaRef = useRef(null);
  const resultCardRef = useRef(null);
  const detailsCardRef = useRef(null);
  const confirmCardRef = useRef(null);
  const ticketCardRef = useRef(null);

  // Audio Speech Recognition Refs
  const recognitionRef = useRef(null);
  const baseTextRef = useRef("");

  const t = UI_TEXT[language] || UI_TEXT.en;

  // Sync flowStep with external props
  useEffect(() => {
    if (filedResult) {
      setFlowStep("filed");
    } else if (routingResult && flowStep === "input") {
      setFlowStep("classified");
    }
  }, [filedResult, routingResult]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  // GSAP Smooth Reveal for Advisory Result
  useGSAP(() => {
    if (flowStep === "classified" && resultCardRef.current) {
      gsap.from(resultCardRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
      });
      resultCardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [flowStep]);

  // GSAP Smooth Reveal for Citizen Details Form
  useGSAP(() => {
    if (flowStep === "details" && detailsCardRef.current) {
      gsap.from(detailsCardRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
      });
      detailsCardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [flowStep]);

  // GSAP Smooth Reveal for Confirmation Card
  useGSAP(() => {
    if (flowStep === "confirm" && confirmCardRef.current) {
      gsap.from(confirmCardRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
      });
      confirmCardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [flowStep]);

  // GSAP Smooth Reveal & Confetti for Stamped Certificate
  useGSAP(() => {
    if (flowStep === "filed" && ticketCardRef.current) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#2563eb", "#059669", "#ea580c"],
        });
      } catch (err) {
        // ignore
      }

      gsap.from(ticketCardRef.current, {
        scale: 0.97,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.2)",
      });
      ticketCardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [flowStep]);

  // --------------------------------------------------------------------------
  // ISSUE 2 & 3: LIVE SPEECH RECOGNITION + TEXT INPUT COEXISTENCE
  // --------------------------------------------------------------------------
  const startSpeechRecognition = () => {
    setApiError(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setApiError(
        language === "hi"
          ? "ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। कृपया Google Chrome या Edge का उपयोग करें।"
          : language === "pa"
          ? "ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਸਪੀਚ ਰਿਕੋਗਨੀਸ਼ਨ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ Google Chrome ਜਾਂ Edge ਵਰਤੋ।"
          : "Browser speech recognition is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    // Preserve baseline text so typing and speech seamlessly merge
    baseTextRef.current = customText ? customText.trimEnd() + " " : "";

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;

      // Use selected language from the UI
      if (language === "hi") {
        recognition.lang = "hi-IN";
      } else if (language === "pa") {
        recognition.lang = "pa-IN";
      } else {
        recognition.lang = "en-IN";
      }

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        // Live text appears inside the same text input in real time
        const combined = baseTextRef.current + finalTranscript + interimTranscript;
        setCustomText(combined);

        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setApiError(
            language === "hi"
              ? "माइक्रोफ़ोन की अनुमति अस्वीकृत है। कृपया ब्राउज़र एड्रेस बार में माइक्रोफ़ोन की अनुमति दें।"
              : language === "pa"
              ? "ਮਾਈਕ੍ਰੋਫ਼ੋਨ ਦੀ ਆਗਿਆ ਰੱਦ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਮਾਈਕ ਦੀ ਆਗਿਆ ਦਿਓ।"
              : "Microphone permission denied. Please allow microphone access in your browser address bar."
          );
          setIsRecording(false);
        } else if (event.error === "language-not-supported" && language === "pa") {
          // If browser lacks pa-IN language pack, fall back to Indian Punjabi/Hindi
          try {
            recognition.lang = "hi-IN";
            recognition.start();
          } catch (e) {
            setIsRecording(false);
          }
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
      setIsRecording(false);
    }
  };

  const stopSpeechRecognition = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      try {
        rec.stop();
      } catch (e) {}
    }
    baseTextRef.current = customText ? customText.trimEnd() + " " : "";
  };

  const toggleSpeechRecognition = () => {
    if (isRecording) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  // --------------------------------------------------------------------------
  // STEP 2: UNDERSTAND / CLASSIFY GRIEVANCE
  // --------------------------------------------------------------------------
  const handleProcessComplaint = async () => {
    setApiError(null);
    if (!customText || !customText.trim()) {
      setApiError(
        language === "hi"
          ? "कृपया भेजने से पहले अपनी समस्या लिखें या बोलें।"
          : language === "pa"
          ? "ਕਿਰਪਾ ਕਰਕੇ ਭੇਜਣ ਤੋਂ ਪਹਿਲਾਂ ਆਪਣੀ ਸਮੱਸਿਆ ਲਿਖੋ ਜਾਂ ਬੋਲੋ।"
          : "Please type or speak your problem before sending."
      );
      return;
    }

    if (isRecording) {
      stopSpeechRecognition();
    }

    // Enrich multilingual keywords so routing works accurately
    const enrichedText = enrichMultilingualInput(customText.trim());

    const bodyData = {
      raw_text: enrichedText,
      citizen_name: citizenName.trim() || (language === "hi" ? "नागरिक" : language === "pa" ? "ਨਾਗਰਿਕ" : "Citizen"),
    };

    setLoading(true);
    setFiledResult(null);
    try {
      const res = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.error || !data.routing) {
        throw new Error(data?.error || `Server returned error (${res.status}).`);
      }
      setRoutingResult(data);
      setFlowStep("classified");
    } catch (e) {
      console.error("Error processing complaint:", e);
      setApiError(e.message || "Failed to reach backend server. Verify Flask is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // STEP 3: CITIZEN DETAILS VALIDATION & ADVANCE
  // --------------------------------------------------------------------------
  const handleProceedToDetails = () => {
    setDetailsError(null);
    setFlowStep("details");
  };

  const handleReviewDetails = (e) => {
    e?.preventDefault();
    setDetailsError(null);
    if (!citizenName.trim() || !citizenAddress.trim()) {
      setDetailsError(t.nameRequiredError);
      return;
    }
    setFlowStep("confirm");
  };

  // --------------------------------------------------------------------------
  // STEP 5: OFFICIAL GRIEVANCE FILING
  // --------------------------------------------------------------------------
  const handleFileComplaint = async () => {
    if (!routingResult) return;
    setFilingLoading(true);
    setFilingError(null);
    try {
      // Include citizen location and phone inside complaint payload
      let finalGrievanceText = customText.trim();
      if (citizenAddress.trim()) {
        finalGrievanceText = `[Location: ${citizenAddress.trim()}] ${finalGrievanceText}`;
      }
      if (citizenPhone.trim()) {
        finalGrievanceText = `${finalGrievanceText} (Citizen Phone: ${citizenPhone.trim()})`;
      }

      const bodyData = {
        raw_text: finalGrievanceText,
        citizen_name: citizenName.trim() || "Citizen",
      };

      const res = await fetch("/api/file-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.error || !data.tracking_id) {
        throw new Error(data?.error || `Failed to file grievance (status ${res.status})`);
      }
      setFiledResult(data);
      setFlowStep("filed");
    } catch (e) {
      console.error("Error filing complaint:", e);
      setFilingError(e.message || "Could not register grievance.");
    } finally {
      setFilingLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleReset = () => {
    stopSpeechRecognition();
    setCustomText("");
    setCitizenName("");
    setCitizenAddress("");
    setCitizenPhone("");
    setRoutingResult(null);
    setFiledResult(null);
    setApiError(null);
    setFilingError(null);
    setDetailsError(null);
    setFlowStep("input");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Department & localized advice resolution
  const deptId = routingResult?.routing?.department_id;
  const localizedInfo = LOCALIZED_ADVICE[deptId]?.[language];

  const displayedDeptName = localizedInfo?.name || routingResult?.routing?.department_name || "Municipal Authority";
  const displayedAdvice = localizedInfo?.advice ||
    routingResult?.response?.statutory_advice ||
    routingResult?.response?.grounded_response ||
    routingResult?.response?.answer ||
    "Your grievance has been verified against municipal policies.";

  return (
    <div className="landing-experience">
      {/* =====================================================================
          STEP 1: CITIZEN PROBLEM INPUT (HERO AREA)
          ===================================================================== */}
      <section className="landing-hero-section">
        <div className="landing-heading-block">
          <h1 className="landing-title">{t.heroTitle}</h1>
          <p className="landing-subtitle">{t.heroSubtitle}</p>
        </div>

        {/* ONE Large Input Container: Typing & Speech Coexist */}
        <div className={`landing-input-card ${isRecording ? "recording" : ""}`}>
          <textarea
            ref={textareaRef}
            className="landing-textarea"
            placeholder={t.inputPlaceholder}
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              baseTextRef.current = e.target.value ? e.target.value.trimEnd() + " " : "";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (customText.trim() && !loading) {
                  handleProcessComplaint();
                }
              }
            }}
            rows={3}
            aria-label="Describe your problem"
          />

          <div className="landing-input-footer">
            <div className="landing-input-hint">
              {isRecording ? (
                <span className="listening-pulse-label">
                  <span className="pulse-indicator-dot" />
                  <span>{t.listening}</span>
                </span>
              ) : (
                <span className="subtle-prompt-lang">{t.promptLang}</span>
              )}
            </div>

            <div className="landing-input-actions">
              {/* Microphone Button (Uses Selected Language) */}
              <button
                type="button"
                className={`btn-landing-mic ${isRecording ? "active" : ""}`}
                onClick={toggleSpeechRecognition}
                title={isRecording ? t.clickToStop : "Speak your problem"}
                aria-label="Microphone"
              >
                {isRecording ? <Square size={16} /> : <Mic size={19} />}
              </button>

              {/* Blue Primary Send Action */}
              <button
                type="button"
                className="btn-landing-send"
                onClick={handleProcessComplaint}
                disabled={loading || !customText.trim()}
                title={t.send}
                aria-label="Send"
              >
                {loading ? (
                  <span className="landing-spinner" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error notification if API fails */}
        {apiError && (
          <div className="landing-error-box">
            <AlertCircle size={16} />
            <span>{apiError}</span>
          </div>
        )}

        {/* THREE SECONDARY ACTIONS (Shown when in initial input state) */}
        {flowStep === "input" && (
          <div className="landing-actions-grid">
            <button
              type="button"
              className="action-card"
              onClick={() => {
                if (textareaRef.current) {
                  textareaRef.current.focus();
                }
              }}
            >
              <div className="action-icon-wrap icon-blue">
                <AlertCircle size={22} />
              </div>
              <div className="action-content">
                <h3 className="action-title">{t.actionReportTitle}</h3>
                <p className="action-desc">{t.actionReportDesc}</p>
              </div>
            </button>

            <button
              type="button"
              className="action-card"
              onClick={() => onNavigateToDocuments && onNavigateToDocuments()}
            >
              <div className="action-icon-wrap icon-emerald">
                <FileText size={22} />
              </div>
              <div className="action-content">
                <h3 className="action-title">{t.actionDocTitle}</h3>
                <p className="action-desc">{t.actionDocDesc}</p>
              </div>
            </button>

            <button
              type="button"
              className="action-card"
              onClick={() => onNavigateToTracker && onNavigateToTracker()}
            >
              <div className="action-icon-wrap icon-indigo">
                <Search size={22} />
              </div>
              <div className="action-content">
                <h3 className="action-title">{t.actionTrackTitle}</h3>
                <p className="action-desc">{t.actionTrackDesc}</p>
              </div>
            </button>
          </div>
        )}
      </section>

      {/* =====================================================================
          STEP 2: UNDERSTAND / CLASSIFY PROBLEM (GROUNDED GUIDANCE CARD)
          ===================================================================== */}
      {flowStep === "classified" && routingResult && (
        <section ref={resultCardRef} className="guidance-result-card">
          <header className="guidance-header">
            <div className="guidance-dept-meta">
              <span className="guidance-tag">
                <ShieldCheck size={14} />
                <span>{t.assignedAuthority}</span>
              </span>
              <h2 className="guidance-dept-name">{displayedDeptName}</h2>
            </div>
            <div className="guidance-sla-badge">
              <Clock size={14} />
              <span>SLA: {routingResult.response?.statutory_sla || "15 Days"}</span>
            </div>
          </header>

          <div className="guidance-meta-row">
            <div className="guidance-meta-item">
              <span className="meta-lbl">{t.authority}</span>
              <span className="meta-val">{routingResult.response?.authority || "UT Administration"}</span>
            </div>
            <div className="guidance-meta-item">
              <span className="meta-lbl">{t.resolutionSla}</span>
              <span className="meta-val">{routingResult.response?.statutory_sla || "Standard SLA"}</span>
            </div>
            {routingResult.response?.helpline && (
              <div className="guidance-meta-item">
                <span className="meta-lbl">{t.helpline}</span>
                <span className="meta-val text-blue">{routingResult.response.helpline}</span>
              </div>
            )}
          </div>

          <div className="guidance-advice-box">
            <h4 className="advice-title">{t.legalAdviceTitle}</h4>
            <p className="advice-body">{displayedAdvice}</p>
          </div>

          <div className="guidance-actions">
            <button
              type="button"
              className="btn-file-primary"
              onClick={handleProceedToDetails}
            >
              <span>{t.fileTicket}</span>
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="btn-ask-another"
              onClick={handleReset}
            >
              <RotateCcw size={15} />
              <span>{t.askAnother}</span>
            </button>
          </div>
        </section>
      )}

      {/* =====================================================================
          STEP 3: ASK FOR MISSING CITIZEN DETAILS
          ===================================================================== */}
      {flowStep === "details" && (
        <section ref={detailsCardRef} className="details-form-card">
          <header className="details-header">
            <span className="guidance-tag" style={{ color: "var(--cobalt)" }}>
              <User size={14} />
              <span>Step 2 of 3 • Citizen Verification</span>
            </span>
            <h2 className="details-title">{t.detailsTitle}</h2>
            <p className="details-subtitle">{t.detailsSubtitle}</p>
          </header>

          {detailsError && (
            <div className="landing-error-box" style={{ marginBottom: "1.25rem" }}>
              <AlertCircle size={16} />
              <span>{detailsError}</span>
            </div>
          )}

          <form onSubmit={handleReviewDetails}>
            <div className="form-grid-2">
              <div className="field-group">
                <label className="field-label">{t.nameLabel} *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    className="field-input"
                    placeholder={t.namePlaceholder}
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">{t.phoneLabel}</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="tel"
                    className="field-input"
                    placeholder={t.phonePlaceholder}
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="field-group" style={{ marginBottom: "1.75rem" }}>
              <label className="field-label">{t.addressLabel} *</label>
              <input
                type="text"
                className="field-input"
                placeholder={t.addressPlaceholder}
                value={citizenAddress}
                onChange={(e) => setCitizenAddress(e.target.value)}
                required
              />
            </div>

            <div className="guidance-actions">
              <button
                type="submit"
                className="btn-file-primary"
              >
                <span>{t.reviewBtn}</span>
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                className="btn-ask-another"
                onClick={() => setFlowStep("classified")}
              >
                <span>{t.backToGuidance}</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* =====================================================================
          STEP 4: SHORT CONFIRMATION CARD BEFORE FILING
          ===================================================================== */}
      {flowStep === "confirm" && (
        <section ref={confirmCardRef} className="confirmation-card">
          <header className="details-header">
            <span className="guidance-tag" style={{ color: "var(--cobalt)" }}>
              <CheckCircle2 size={14} />
              <span>Step 3 of 3 • Review & Official Confirmation</span>
            </span>
            <h2 className="details-title">{t.confirmTitle}</h2>
            <p className="details-subtitle">{t.confirmSubtitle}</p>
          </header>

          <div className="confirm-grid">
            <div className="confirm-cell">
              <span className="meta-lbl">{t.citizenSummary}</span>
              <span className="meta-val">{citizenName}</span>
            </div>
            <div className="confirm-cell">
              <span className="meta-lbl">{t.locationSummary}</span>
              <span className="meta-val">{citizenAddress}</span>
            </div>
            <div className="confirm-cell">
              <span className="meta-lbl">{t.phoneSummary}</span>
              <span className="meta-val">{citizenPhone || "Not provided"}</span>
            </div>
            <div className="confirm-cell">
              <span className="meta-lbl">{t.deptSummary}</span>
              <span className="meta-val text-blue">{displayedDeptName}</span>
            </div>
            <div className="confirm-cell">
              <span className="meta-lbl">{t.slaSummary}</span>
              <span className="meta-val" style={{ color: "var(--amber)" }}>
                {routingResult?.response?.statutory_sla || "15 Days"}
              </span>
            </div>
          </div>

          <div className="confirm-problem-box">
            <span className="meta-lbl" style={{ marginBottom: "6px", display: "block" }}>
              {t.problemSummary}:
            </span>
            <p style={{ fontSize: "0.92rem", color: "var(--slate-800)", margin: 0, lineHeight: 1.55 }}>
              "{customText}"
            </p>
          </div>

          {filingError && (
            <div className="landing-error-box" style={{ marginBottom: "1.25rem" }}>
              <AlertCircle size={16} />
              <span>{filingError}</span>
            </div>
          )}

          <div className="guidance-actions">
            <button
              type="button"
              className="btn-file-primary"
              onClick={handleFileComplaint}
              disabled={filingLoading}
            >
              <ShieldCheck size={18} />
              <span>{filingLoading ? t.filing : t.confirmAndFileBtn}</span>
            </button>

            <button
              type="button"
              className="btn-ask-another"
              onClick={() => setFlowStep("details")}
              disabled={filingLoading}
            >
              <FileEdit size={15} />
              <span>{t.editDetailsBtn}</span>
            </button>
          </div>
        </section>
      )}

      {/* =====================================================================
          STEP 6: OFFICIAL FILED TICKET CONFIRMATION
          ===================================================================== */}
      {flowStep === "filed" && filedResult && (
        <section ref={ticketCardRef} className="ticket-result-card">
          <header className="ticket-header">
            <div>
              <span className="ticket-status-pill">
                <CheckCircle2 size={14} />
                <span>{t.officiallyFiled}</span>
              </span>
              <div className="ticket-id-row">
                <span className="ticket-id-text">{filedResult.tracking_id}</span>
                <button
                  type="button"
                  className="btn-copy-id"
                  onClick={() => copyToClipboard(filedResult.tracking_id)}
                  title={t.copy}
                >
                  {copiedId ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  <span>{copiedId ? t.copied : t.copy}</span>
                </button>
              </div>
            </div>

            <span className="badge-ticket-status">
              ● {filedResult.status || "Filed"}
            </span>
          </header>

          <div className="ticket-details-grid">
            <div className="detail-item">
              <span className="detail-lbl">{t.citizenSummary}</span>
              <span className="detail-val">{filedResult.citizen_name || citizenName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-lbl">{t.department}</span>
              <span className="detail-val">{filedResult.department_name || displayedDeptName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-lbl">{t.targetResolution}</span>
              <span className="detail-val text-amber">
                {filedResult.sla_target_days ? `${filedResult.sla_target_days} Days` : "15 Days"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-lbl">{t.targetDate}</span>
              <span className="detail-val">
                {filedResult.sla_deadline ? new Date(filedResult.sla_deadline).toLocaleDateString() : "Pending"}
              </span>
            </div>
          </div>

          <div className="ticket-btn-row">
            <button
              type="button"
              className="btn-track-ticket"
              onClick={() => onNavigateToTracker(filedResult.tracking_id, filedResult)}
            >
              <Search size={16} />
              <span>{t.trackStatusBtn}</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              className="btn-ask-another"
              onClick={handleReset}
            >
              <RotateCcw size={15} />
              <span>{t.askAnother}</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
