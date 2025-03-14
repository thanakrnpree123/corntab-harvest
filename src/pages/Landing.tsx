
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-20">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 dark:text-blue-400 mb-4">
            CornTab
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            การจัดการงาน Cron แบบมืออาชีพสำหรับทีมของคุณ
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-400">ตั้งเวลาทำงานอัตโนมัติ</CardTitle>
              <CardDescription>จัดการงานที่ต้องทำซ้ำๆ ได้อย่างมีประสิทธิภาพ</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                ใช้ Cron Expression ที่มีประสิทธิภาพเพื่อกำหนดเวลาทำงานแบบซับซ้อนสำหรับงานของคุณ ไม่ว่าจะเป็นรายชั่วโมง รายวัน รายสัปดาห์ หรือตามรูปแบบที่กำหนดเอง
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-400">ติดตามและแจ้งเตือน</CardTitle>
              <CardDescription>รู้สถานะงานของคุณตลอดเวลา</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                ดูประวัติการทำงาน ตรวจสอบข้อผิดพลาด และรับการแจ้งเตือนเมื่องานสำเร็จหรือล้มเหลว เพื่อให้คุณสามารถแก้ไขปัญหาได้อย่างรวดเร็ว
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-400">จัดการโปรเจค</CardTitle>
              <CardDescription>จัดระเบียบงานตามโปรเจค</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                จัดกลุ่มงานตามโปรเจคเพื่อให้ทีมของคุณสามารถจัดการและติดตามงานได้อย่างมีประสิทธิภาพยิ่งขึ้น
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-800 dark:text-blue-300 mb-6">
            เริ่มต้นใช้งาน CornTab วันนี้
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/login">เข้าสู่ระบบ</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/">เข้าสู่หน้าแดชบอร์ด</Link>
            </Button>
          </div>
        </div>

        <footer className="text-center text-gray-600 dark:text-gray-400 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p>© {new Date().getFullYear()} CornTab. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
