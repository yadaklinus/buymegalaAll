"use client"
import React, { useState } from 'react';
import { Shield, FileText, Eye, Lock, Users, CreditCard, AlertTriangle, Mail, Phone } from 'lucide-react';

const termsAndConditions = [
    {
      heading: "Acceptance of Terms",
      content:
        "By using Buy Me Gala, you agree to comply with and be bound by these Terms and Conditions. These Terms apply to all users of the platform, including creators and supporters. If you do not agree with any part of these Terms, you must not use the platform."
    },
    {
      heading: "Eligibility",
      content:
        "To use Buy Me Gala, you must be at least 18 years old and capable of entering into legally binding agreements under Nigerian law. By creating an account, you represent and warrant that you meet these eligibility requirements."
    },
    {
      heading: "User Accounts",
      content:
        "When creating an account, you must provide accurate, complete, and up-to-date information. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. We reserve the right to suspend or terminate accounts that provide false information or engage in unauthorized activities."
    },
    {
      heading: "Creator Responsibilities",
      content:
        "Creators are responsible for ensuring that their profile and content comply with all applicable laws and regulations. Creators must provide valid payout details for receiving contributions. All funds received should be used responsibly and in accordance with the purpose communicated to supporters. Misuse of funds may result in suspension or permanent account termination."
    },
    {
      heading: "Supporter Contributions",
      content:
        "Supporters make voluntary contributions to creators through the Buy Me Gala platform. These contributions are non-refundable, except where required by law or where explicitly stated by the platform. Supporters acknowledge that contributions are not investments or purchases but voluntary support for creators."
    },
    {
      heading: "Payments and Payouts",
      content:
        "Payments are processed securely through Flutterwave and other authorized payment processors. Transaction fees may apply and will be deducted automatically from the amount received before payouts are credited. Creators will receive payouts every Friday or according to the payout schedule communicated by the platform. The platform is not responsible for delays caused by banking systems, payment gateways, or incorrect payout details provided by creators."
    },
    {
      heading: "Fees and Charges",
      content:
        "Buy Me Gala reserves the right to charge service fees, transaction fees, or other charges necessary for the operation of the platform. Fees are automatically deducted from contributions before payouts. The applicable fee structure may be updated from time to time, and continued use of the platform indicates acceptance of the updated fees."
    },
    {
      heading: "Prohibited Activities",
      content:
        "Users must not use the platform for illegal, fraudulent, or harmful activities. This includes but is not limited to money laundering, financing of terrorism, impersonation of others, spreading harmful content, or engaging in activities that violate local or international laws. Any violation of this clause may result in immediate account suspension, reporting to authorities, and forfeiture of funds."
    },
    {
      heading: "Intellectual Property",
      content:
        "All content, trademarks, service marks, and branding on Buy Me Gala are the property of the platform or its licensors. Users may not copy, reproduce, distribute, or exploit platform content without prior written permission. Creators retain ownership of the content they upload but grant Buy Me Gala a license to display and promote their content within the platform."
    },
    {
      heading: "Termination",
      content:
        "We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or threaten the safety and integrity of the platform. Upon termination, access to your account and associated services will be revoked, and any pending payouts may be withheld if related to fraudulent activity."
    },
    {
      heading: "Limitation of Liability",
      content:
        "Buy Me Gala is not liable for indirect, incidental, special, or consequential damages arising from the use or inability to use the platform. We do not guarantee uninterrupted or error-free service and shall not be held responsible for losses resulting from delays, technical issues, or actions of third-party service providers such as banks and payment processors."
    },
    {
      heading: "Changes to Terms",
      content:
        "We may update or modify these Terms and Conditions from time to time. Any significant changes will be communicated to users via email or by posting an update on the platform. Continued use of the platform after the changes take effect constitutes your acceptance of the revised Terms."
    },
    {
      heading: "Governing Law",
      content:
        "These Terms and Conditions are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Nigeria."
    },
    {
      heading: "Contact Us",
      content:
        "If you have questions or concerns regarding these Terms and Conditions, please contact us at: support@buymegala.com"
    }
  ]
  

  const privacyPolicy = [
    {
      heading: "Introduction",
      content:
        "Buy Me Gala (“we,” “our,” or “us”) values your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our platform."
    },
    {
      heading: "Information We Collect",
      content:
        "We collect the following information: Personal Information such as name, email, phone number, payout account details, and other information provided during registration. Transaction Data such as payment details, contributions made, payout history, and related financial records. Usage Data such as device information, IP addresses, browser type, and interaction logs with our platform. Cookies and Tracking information which we use to enhance your experience."
    },
    {
      heading: "How We Use Your Information",
      content:
        "We use your information to provide and operate the platform effectively, to process contributions, payments, and payouts securely, to personalize user experiences and recommendations, to detect and prevent fraudulent or unauthorized activities, to comply with legal, regulatory, and financial obligations, and to communicate with you about updates, promotions, or support issues."
    },
    {
      heading: "Sharing of Information",
      content:
        "We may share your information with Payment Providers such as Flutterwave to process transactions. We also work with Service Providers who offer hosting, analytics, and support services. We may disclose information for legal reasons if required by law, regulation, or court order. Finally, we may share your information when you give explicit consent."
    },
    {
      heading: "Data Retention",
      content:
        "We retain your information for as long as your account is active, or as necessary to comply with legal obligations, resolve disputes, and enforce our agreements."
    },
    {
      heading: "Security of Information",
      content:
        "We implement appropriate technical and organizational measures to protect your personal information, including SSL encryption, secure data storage, and access controls. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security."
    },
    {
      heading: "User Rights",
      content:
        "You have the right to access your personal data, to request corrections to inaccurate information, to request deletion of your account and personal data subject to legal requirements, to restrict certain types of data processing, and to opt out of communications or promotional messages."
    },
    {
      heading: "Cookies and Tracking Technologies",
      content:
        "We use cookies, web beacons, and analytics tools to monitor activity and improve user experiences. You may disable cookies in your browser settings, but this may limit certain functionalities."
    },
    {
      heading: "Third-Party Links",
      content:
        "Our platform may contain links to third-party websites. We are not responsible for the privacy practices or content of such external sites."
    },
    {
      heading: "Children's Privacy",
      content:
        "Our platform is not directed toward children under the age of 18. We do not knowingly collect information from individuals under 18 years of age. If we become aware that a minor has provided personal data, we will delete it immediately."
    },
    {
      heading: "International Data Transfers",
      content:
        "If you access the platform from outside Nigeria, note that your information may be transferred to and processed in countries with different data protection laws."
    },
    {
      heading: "Changes to This Privacy Policy",
      content:
        "We may update this Privacy Policy periodically. If significant changes are made, we will notify you via email or by posting a notice on the platform. Continued use of the platform after changes indicates your acceptance."
    },
    
  ]
  
  

export default function TermsPrivacyPage() {
    const [activeSection, setActiveSection] = useState('terms');
    const lastUpdated = "September 15, 2025";

    return (
        <div className="max-w-5xl mx-auto min-h-screen py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="bg-yellow-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-yellow-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Terms & Privacy Policy
                </h1>
                <p className="text-xl  max-w-2xl mx-auto">
                    Your trust is important to us. Please read these terms and our privacy policy carefully.
                </p>
                <p className="text-sm text-gray-500 mt-4">Last updated: {lastUpdated}</p>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-gray-200 backdrop-blur-sm border border-gray-700/50 rounded-xl p-2 mb-8 flex">
                <button
                    onClick={() => setActiveSection('terms')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                        activeSection === 'terms'
                            ? 'bg-yellow-500 text-black font-semibold'
                            : ' hover: hover:bg-gray-700/30'
                    }`}
                >
                    <FileText className="w-5 h-5" />
                    Terms & Conditions
                </button>
                <button
                    onClick={() => setActiveSection('privacy')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                        activeSection === 'privacy'
                            ? 'bg-yellow-500 text-black font-semibold'
                            : ' hover: hover:bg-gray-700/30'
                    }`}
                >
                    <Lock className="w-5 h-5" />
                    Privacy Policy
                </button>
            </div>

            {/* Terms and Conditions Section */}
            {activeSection === 'terms' && (
                <div className="bg-gray-200 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 space-y-8">
                    <div className="text-center mb-8">
                        <FileText className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2">Terms and Conditions</h2>
                        <p className="">Welcome to Buy Me Gala (“the Platform”, “we”, “our”, “us”). By accessing or using our services, you agree to the following Terms and Conditions. Please read them carefully.</p>
                    </div>

                    <div className="space-y-6">
                        {/* Term 1 */}
                        
                    {termsAndConditions.map((terms:any,index)=>(
                        <div key={index} className="border-l-4 border-yellow-500 pl-6 py-4 bg-white rounded-r-lg">
                            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                <span className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">{index+1}</span>
                                {terms.heading}
                            </h3>
                            <p className="leading-relaxed">
                                {terms.content}
                            </p>
                        </div>
                    ))}
                   
                    </div>
                </div>
            )}

            {/* Privacy Policy Section */}
            {activeSection === 'privacy' && (
                <div className="bg-gray-200 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 space-y-8">
                    <div className="text-center mb-8">
                        <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2">Privacy Policy</h2>
                        <p className="">At Buy Me Gala (“we”, “our”, “us”), your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal data when you use our services.</p>
                    </div>

                    <div className="space-y-6">
                      
                    {privacyPolicy.map((terms:any,index)=>(
                        <div key={index} className="border-l-4 border-yellow-500 pl-6 py-4 bg-white rounded-r-lg">
                            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                <span className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">{index+1}</span>
                                {terms.heading}
                            </h3>
                            <p className="leading-relaxed">
                                {terms.content}
                            </p>
                        </div>
                    ))}

                       
                    </div>
                </div>
            )}

            {/* Contact Information */}
            <div className="mt-12 bg-gray-200 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">Need Help or Have Questions?</h3>
                    <p className="">We're here to help clarify any concerns about our terms or privacy practices.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 text-center">
                        <Mail className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                        <h4 className="text-lg font-semibold  mb-2">Email Support</h4>
                        <p className=" text-sm mb-3">Get in touch with our support team</p>
                        <a 
                            href="mailto:support@buymegala.app" 
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                            support@buymegala.app
                        </a>
                    </div>

                    <div className="bg-white rounded-lg p-6 text-center">
                        <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                        <h4 className="text-lg font-semibold  mb-2">Privacy Officer</h4>
                        <p className=" text-sm mb-3">For data protection inquiries</p>
                        <a 
                            href="mailto:privacy@buymegala.app" 
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            privacy@buymegala.app
                        </a>
                    </div>
                </div>
            </div>

            </div>
    )
}