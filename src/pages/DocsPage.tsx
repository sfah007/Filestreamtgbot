import { useState } from 'react';
import { motion } from 'motion/react';
import { Book, Server, Settings, ArrowLeft, Globe, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DocsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started / البداية', icon: <Book className="w-5 h-5" /> },
    { id: 'env-vars', title: 'Environment Variables / المتغيرات', icon: <Settings className="w-5 h-5" /> },
    { id: 'docker', title: 'Docker Deployment / دوكر', icon: <Server className="w-5 h-5" /> },
    { id: 'heroku', title: 'Heroku Deployment / هيروكو', icon: <Globe className="w-5 h-5" /> },
    { id: 'render', title: 'Render & Railway / منصات أخرى', icon: <Database className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="space-y-6 text-zinc-300">
            <h2 className="text-3xl font-bold text-white mb-4">Introduction / مقدمة</h2>
            <p>
              StreamBox is a powerful Telegram-based file streaming service. It uses Telegram's 2GB file limit to provide free, unlimited cloud storage for your files, generating direct stream and download links instantly.
            </p>
            <p dir="rtl" className="text-right">
              ستريم بوكس هو خدمة قوية لبث الملفات تعتمد على تيليجرام. تستخدم حد الـ 2 جيجابايت الخاص بتيليجرام لتوفير مساحة تخزين سحابية مجانية وغير محدودة لملفاتك، مع إنشاء روابط بث وتحميل مباشرة فوراً.
            </p>
            
            <h3 className="text-xl font-semibold text-white mt-8 mb-3">Features / المميزات</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Upload files up to 2GB / رفع ملفات حتى 2 جيجابايت</li>
              <li>Direct video & audio streaming / بث مباشر للفيديو والصوت</li>
              <li>Admin dashboard for management / لوحة تحكم للإدارة</li>
              <li>Bilingual support (EN/AR) / دعم اللغتين الإنجليزية والعربية</li>
            </ul>
          </div>
        );
      case 'env-vars':
        return (
          <div className="space-y-6 text-zinc-300">
            <h2 className="text-3xl font-bold text-white mb-4">Environment Variables / المتغيرات البيئية</h2>
            <p>To run StreamBox, you need the following credentials from Telegram: / لتشغيل المشروع، تحتاج إلى هذه البيانات من تيليجرام:</p>
            
            <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-4 text-white font-medium">Variable / المتغير</th>
                    <th className="p-4 text-white font-medium">Description / الوصف</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="p-4 font-mono text-indigo-400">TELEGRAM_API_ID</td>
                    <td className="p-4">Your API ID from my.telegram.org</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-4 font-mono text-indigo-400">TELEGRAM_API_HASH</td>
                    <td className="p-4">Your API Hash from my.telegram.org</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-4 font-mono text-indigo-400">TELEGRAM_BOT_TOKEN</td>
                    <td className="p-4">Bot token from @BotFather</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono text-indigo-400">BIN_CHANNEL_ID</td>
                    <td className="p-4">Storage channel ID (e.g., -1001234567890). Bot must be admin.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'docker':
        return (
          <div className="space-y-6 text-zinc-300">
            <h2 className="text-3xl font-bold text-white mb-4">Docker Deployment / النشر عبر دوكر</h2>
            <p>StreamBox includes a <code>Dockerfile</code> and <code>docker-compose.yml</code> for easy containerized deployment.</p>
            <p dir="rtl" className="text-right">يحتوي المشروع على ملفات دوكر جاهزة لتسهيل عملية النشر والتشغيل.</p>
            
            <h3 className="text-xl font-semibold text-white mt-8 mb-3">Using Docker Compose / باستخدام Docker Compose</h3>
            <div className="bg-black/60 p-4 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
              <pre>
{`# 1. Clone the repository
git clone https://github.com/yourusername/streambox.git
cd streambox

# 2. Create .env file with your variables
nano .env

# 3. Start the container
docker-compose up -d`}
              </pre>
            </div>
            <p className="mt-4 text-sm text-zinc-400">The app will be available at <code>http://localhost:3000</code>. Uploads and database are persisted in volumes.</p>
          </div>
        );
      case 'heroku':
        return (
          <div className="space-y-6 text-zinc-300">
            <h2 className="text-3xl font-bold text-white mb-4">Heroku Deployment / النشر عبر هيروكو</h2>
            <p>You can deploy StreamBox to Heroku with a single click or via the Heroku CLI.</p>
            <p dir="rtl" className="text-right">يمكنك نشر المشروع على هيروكو بضغطة زر أو عبر سطر الأوامر.</p>
            
            <h3 className="text-xl font-semibold text-white mt-8 mb-3">One-Click Deploy / النشر بضغطة زر</h3>
            <p>Click the button below to deploy directly to Heroku (requires a Heroku account):</p>
            <a href="https://heroku.com/deploy" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 mb-4">
              <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy" />
            </a>

            <h3 className="text-xl font-semibold text-white mt-8 mb-3">Heroku CLI / عبر سطر الأوامر</h3>
            <div className="bg-black/60 p-4 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
              <pre>
{`heroku login
heroku create my-streambox-app
git push heroku main
heroku config:set TELEGRAM_API_ID=your_id TELEGRAM_API_HASH=your_hash ...`}
              </pre>
            </div>
          </div>
        );
      case 'render':
        return (
          <div className="space-y-6 text-zinc-300">
            <h2 className="text-3xl font-bold text-white mb-4">Render & Railway / منصات أخرى</h2>
            <p>StreamBox is pre-configured for modern PaaS providers.</p>
            
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Render</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Connect your GitHub repository to Render.</li>
              <li>Render will automatically detect the <code>render.yaml</code> file.</li>
              <li>Add your environment variables in the dashboard.</li>
              <li>Deploy! (A persistent disk is recommended for the SQLite database).</li>
            </ol>

            <h3 className="text-xl font-semibold text-white mt-8 mb-3">Railway</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Create a new project from GitHub on Railway.</li>
              <li>Railway uses the <code>railway.json</code> configuration automatically.</li>
              <li>Add a volume mounted to <code>/app/uploads</code> and <code>/app/data.db</code>.</li>
              <li>Add your environment variables and deploy.</li>
            </ol>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden">
      <div className="atmosphere-bg"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl w-full glass-panel rounded-3xl overflow-hidden relative z-10 my-8 flex flex-col md:flex-row min-h-[80vh]"
      >
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-black/20 border-r border-white/5 p-6 flex flex-col">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-zinc-400 hover:text-white transition-colors group mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home / عودة
          </button>
          
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Book className="w-6 h-6 mr-3 text-indigo-400" />
            Documentation
          </h2>
          
          <nav className="space-y-2 flex-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                  activeSection === section.id 
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <span className="mr-3">{section.icon}</span>
                <span className="font-medium text-sm">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
