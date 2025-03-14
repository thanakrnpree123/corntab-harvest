
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, Clock, Database, Users } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4">
        <header className="flex flex-col md:flex-row items-center justify-between py-8 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400">CornTab</h2>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Button asChild variant="ghost" className="text-gray-600 dark:text-gray-300">
              <Link to="/login">เข้าสู่ระบบ</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/signup">ลงทะเบียน</Link>
            </Button>
          </div>
        </header>

        <section className="py-20 md:py-32 flex flex-col items-center text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-blue-900 dark:text-blue-400 mb-6 leading-tight">
              การจัดการงาน Cron แบบมืออาชีพ
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
              จัดการ เฝ้าติดตาม และกำหนดเวลาการทำงานอัตโนมัติสำหรับทีมของคุณ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                <Link to="/login">เริ่มต้นใช้งานฟรี</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg">
                <Link to="/demo">ดูการสาธิต</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-800 dark:text-blue-300 mb-12">
            คุณสมบัติหลัก
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-100 dark:border-blue-900 transform hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-blue-700 dark:text-blue-400">ตั้งเวลาทำงานอัตโนมัติ</CardTitle>
                  <CardDescription>จัดการงานที่ต้องทำซ้ำๆ</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  ใช้ Cron Expression เพื่อกำหนดเวลาทำงานแบบซับซ้อนสำหรับงานของคุณ รายชั่วโมง รายวัน หรือตามรูปแบบที่กำหนดเอง
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-100 dark:border-blue-900 transform hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-blue-700 dark:text-blue-400">ติดตามและแจ้งเตือน</CardTitle>
                  <CardDescription>รู้สถานะงานของคุณตลอดเวลา</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  ดูประวัติการทำงาน ตรวจสอบข้อผิดพลาด และรับการแจ้งเตือนเมื่องานสำเร็จหรือล้มเหลว เพื่อแก้ไขปัญหาได้อย่างรวดเร็ว
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-100 dark:border-blue-900 transform hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-blue-700 dark:text-blue-400">จัดการโปรเจค</CardTitle>
                  <CardDescription>จัดระเบียบงานตามโปรเจค</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  จัดกลุ่มงานตามโปรเจคเพื่อให้ทีมของคุณสามารถจัดการและติดตามงานได้อย่างมีประสิทธิภาพยิ่งขึ้น
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-100 dark:border-blue-900 transform hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-blue-700 dark:text-blue-400">ประวัติการทำงาน</CardTitle>
                  <CardDescription>ตรวจสอบย้อนหลังได้ง่าย</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  เก็บประวัติการทำงานทั้งหมดเพื่อการตรวจสอบและวิเคราะห์ พร้อมฟังก์ชันการค้นหาอัจฉริยะที่ช่วยให้คุณพบข้อมูลที่ต้องการได้อย่างรวดเร็ว
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            เริ่มต้นใช้งาน CornTab วันนี้
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            ลดเวลาในการจัดการงานที่ทำซ้ำๆ และเพิ่มประสิทธิภาพในการทำงานของทีม
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Link to="/login">เริ่มต้นใช้งานฟรี</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-blue-700/30">
              <Link to="/contact">ติดต่อทีมขาย</Link>
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
                บริการจัดการงาน Cron แบบมืออาชีพสำหรับทีมของคุณ
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">ผลิตภัณฑ์</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">คุณสมบัติ</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">ราคา</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">บริษัท</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">เกี่ยวกับเรา</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">บล็อก</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">ติดต่อ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">ความช่วยเหลือ</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">เอกสาร</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">การสนับสนุน</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">สถานะระบบ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} CornTab. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
