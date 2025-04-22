
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, Clock, Database, Users } from "lucide-react";
import { useTranslation } from 'react-i18next';

const Landing = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4">
        <header className="flex flex-col md:flex-row items-center justify-between py-8 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400">CornTab</h2>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Button asChild variant="ghost" className="text-gray-600 dark:text-gray-300">
              <Link to="/login">{t('common.login')}</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/signup">{t('common.signup')}</Link>
            </Button>
          </div>
        </header>

        <section className="py-20 md:py-32 flex flex-col items-center text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-blue-900 dark:text-blue-400 mb-6 leading-tight">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
              {t('landing.hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                <Link to="/login">{t('landing.hero.getStarted')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg">
                <Link to="/demo">{t('landing.hero.watchDemo')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-800 dark:text-blue-300 mb-12">
            {t('landing.features.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-100 dark:border-blue-900 transform hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-blue-700 dark:text-blue-400">{t('landing.features.scheduling.title')}</CardTitle>
                  <CardDescription>{t('landing.features.scheduling.description')}</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-100 dark:border-blue-900 transform hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-blue-700 dark:text-blue-400">{t('landing.features.monitoring.title')}</CardTitle>
                  <CardDescription>{t('landing.features.monitoring.description')}</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-100 dark:border-blue-900 transform hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-blue-700 dark:text-blue-400">{t('landing.features.projects.title')}</CardTitle>
                  <CardDescription>{t('landing.features.projects.description')}</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-100 dark:border-blue-900 transform hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-blue-700 dark:text-blue-400">{t('landing.features.history.title')}</CardTitle>
                  <CardDescription>{t('landing.features.history.description')}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('landing.cta.title')}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {t('landing.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Link to="/login">{t('landing.cta.startFree')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-blue-700/30">
              <Link to="/contact">{t('landing.cta.contactSales')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-4">CornTab</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('landing.footer.about')}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">{t('landing.footer.products')}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">{t('common.features')}</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">{t('common.pricing')}</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">{t('landing.footer.company')}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">{t('common.about')}</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">{t('common.blog')}</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">{t('common.contact')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">{t('landing.footer.help')}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">{t('common.documentation')}</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">{t('common.support')}</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">{t('common.status')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} CornTab. {t('landing.footer.allRightsReserved')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
