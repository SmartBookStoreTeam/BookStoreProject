import React from "react";
import { useTranslation } from "react-i18next";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  X, 
  Pencil, 
  BookOpen,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AuthorStatusModal = ({ status, onClose, applicationData }) => {
  const {  i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === "ar";

  if (!status) return null;

  const config = {
    pending: {
      icon: <Clock className="w-12 h-12 text-amber-500" />,
      title: isAr ? "طلبك قيد المراجعة" : "Application Under Review",
      description: isAr 
        ? "شكراً لاهتمامك بالانضمام إلينا كمؤلف. فريقنا يراجع طلبك الآن، وسنقوم بالرد عليك خلال 3-5 أيام عمل."
        : "Thank you for your interest in joining as an author. Our team is currently reviewing your application, and we will get back to you within 3-5 business days.",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      borderColor: "border-zinc-200 dark:border-zinc-800",
      buttonText: isAr ? "فهمت" : "Got it",
      buttonColor: "bg-zinc-600 hover:bg-zinc-700",
    },
    approved: {
      icon: <CheckCircle className="w-12 h-12 text-emerald-500" />,
      title: isAr ? "تهانينا! تم قبول طلبك" : "Congratulations! Approved",
      description: isAr
        ? "لقد أصبحت الآن مؤلفاً معتمداً في بوك فلاي! يمكنك البدء في نشر كتبك ومتابعة مبيعاتك من لوحة تحكم المؤلف."
        : "You are now a certified author at Bookfly! You can start publishing your books and track your sales from the Author Dashboard.",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      borderColor: "border-zinc-200 dark:border-zinc-800",
      buttonText: isAr ? "الذهاب للوحة التحكم" : "Go to Dashboard",
      buttonColor: "bg-zinc-600 hover:bg-zinc-700",
      action: () => {
        navigate("/author-dashboard");
        onClose();
      }
    },
    rejected: {
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      title: isAr ? "نعتذر، لم يتم قبول الطلب" : "Application Not Approved",
      description: isAr
        ? `للأسف، لم نتمكن من قبول طلبك في الوقت الحالي. ${applicationData?.adminFeedback ? `السبب: ${applicationData.adminFeedback}` : ""}`
        : `Unfortunately, we couldn't approve your application at this time. ${applicationData?.adminFeedback ? `Reason: ${applicationData.adminFeedback}` : ""}`,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-zinc-200 dark:border-zinc-800",
      buttonText: isAr ? "تعديل الطلب" : "Edit Application",
      buttonColor: "bg-red-600 hover:bg-red-700",
      action: () => {
        navigate("/register/author"); // Or wherever the edit page is
        onClose();
      }
    }
  };

  const current = config[status] || config.pending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        dir={isAr ? "rtl" : "ltr"}
        className={`relative w-full max-w-lg overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border ${current.borderColor} animate-in zoom-in-95 duration-300`}
      >
        {/* Decorative background elements */}
        <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-20 blur-3xl ${current.bgColor}`}></div>
        <div className={`absolute bottom-0 left-0 w-32 h-32 -ml-16 -mb-16 rounded-full opacity-20 blur-3xl ${current.bgColor}`}></div>

        <div className="relative p-8 text-center">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="cursor-pointer absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Status Icon */}
          <div className={`inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl ${current.bgColor} animate-bounce-subtle`}>
            {current.icon}
          </div>

          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            {current.title}
          </h2>
          
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
            {current.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <button
              onClick={current.action || onClose}
              className={`cursor-pointer w-full sm:w-auto px-8 py-3 rounded-xl text-white font-bold shadow-lg shadow-zinc-900/10 transition-all active:scale-95 flex items-center justify-center gap-2 ${current.buttonColor}`}
            >
              {current.buttonText}
              {!isAr ? <ArrowRight size={18} /> : <ArrowRight size={18} className="rotate-180" />}
            </button>
            
            {status === "pending" && (
              <button
                onClick={onClose}
                className="cursor-pointer w-full sm:w-auto px-8 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-500 flex items-center justify-center gap-2">
            <BookOpen size={14} />
            {isAr ? "بوك فلاي - منصة المؤلفين المبدعين" : "Bookfly - Creative Authors Platform"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthorStatusModal;
