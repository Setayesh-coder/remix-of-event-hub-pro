import { Link } from 'react-router-dom';
import { Instagram, Send, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary border-t border-primary/80 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">

              <img className="w-40 h-40 rounded-lg flex items-center justify-center" src="public/images/logos/logo4.png" alt="ME" />

              <span className="text-lg font-bold text-white">میکروالکترونیک</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              رویداد میکروالکترونیک، فرصتی برای یادگیری و ارتقای مهارت‌های شما در حوزه الکترونیک و تکنولوژی
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">دسترسی سریع</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/gallery" className="text-white/70 hover:text-white transition-colors text-sm">
                  گالری
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-white/70 hover:text-white transition-colors text-sm">
                  آموزش
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-white/70 hover:text-white transition-colors text-sm">
                  برنامه‌ها و زمانبندی
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-white/70 hover:text-white transition-colors text-sm">
                  ثبت نام
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">تماس با ما</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Phone className="w-4 h-4 text-white" />

                ۰۹۹۲۷۱۱۸۴۷۳
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Mail className="w-4 h-4 text-white" />
                info@microelectronics.ir
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <MapPin className="w-4 h-4 text-white" />
                تهران، فردوسی، کوچه براتی
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">شبکه‌های اجتماعی</h3>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/Microelectronic_ir"
                className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a
                href="https://t.me/Microelectronic_ir"
                className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-300"
              >
                <Send className="w-5 h-5" />
              </a>
              <a
                href="https://ble.ir/Microelectronic_ir"
                className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-300"
              >
                {/* <Instagram className="w-5 h-5" /> */}<svg className="w-5 h-5" fill="#ffffff" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M11.425 23.987a12.218 12.218 0 0 1-2.95-.514 6.578 6.578 0 0 0-.336-.116C4.936 22.303 2.22 19.763.913 16.599a11.92 11.92 0 0 1-.9-4.063C.005 12.377.001 10.246 0 6.74 0 .71-.005 1.137.07.903.23.394.673.05 1.224.005c.421-.034.7.088 1.603.699.562.38 1.119.78 1.796 1.289.315.237.353.261.376.247l.35-.23c.58-.381 1.11-.677 1.7-.945A11.913 11.913 0 0 1 9.766.21a11.19 11.19 0 0 1 2.041-.2c1.14-.016 2.077.091 3.152.36 3.55.888 6.538 3.411 8.028 6.78.492 1.113.845 2.43.945 3.522.033.366.039.43.053.611.008.105.015.406.015.669 0 .783-.065 1.57-.169 2.064a5.474 5.474 0 0 0-.046.26c-.056.378-.214.987-.399 1.535-.205.613-.367.999-.684 1.633a11.95 11.95 0 0 1-2.623 3.436c-.44.396-.829.705-1.26 1.003-.647.445-1.307.812-2.039 1.134-.6.265-1.44.539-2.101.686a11.165 11.165 0 0 1-1.178.202 12.28 12.28 0 0 1-2.076.082zm-.61-5.92c.294-.06.678-.209.864-.337.144-.099.428-.376 2.064-2.013a161.8 161.8 0 0 1 1.764-1.753c.017 0 1.687-1.67 1.687-1.689 0-.02 1.64-1.648 1.661-1.648.01 0 .063-.047.118-.106.467-.495.682-.957.716-1.547.026-.433-.06-.909-.217-1.196a2.552 2.552 0 0 0-.983-1.024c-.281-.163-.512-.233-.888-.27-.306-.031-.688 0-.948.075-.243.07-.603.274-.853.481-.042.035-1.279 1.265-2.748 2.733l-2.671 2.67-1.093-1.09c-.6-.6-1.12-1.114-1.155-1.142a2.419 2.419 0 0 0-1.338-.51c-.404-.013-.91.09-1.224.25a2.89 2.89 0 0 0-.659.526c-.108.12-.287.357-.29.385-.003.03-.009.044-.065.16a2.312 2.312 0 0 0-.224.91c-.011.229-.01.265.019.491.045.353.24.781.51 1.115.05.063.97.992 2.044 2.064 1.507 1.505 1.98 1.97 2.074 2.039.327.24.683.388 1.101.456.182.03.5.016.734-.03z"></path></g></svg>
              </a> <a
                href="https://eitaa.ir/Microelectronic_ir"
                className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="#ffffff" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M5.968 23.942a6.624 6.624 0 0 1-2.332-.83c-1.62-.929-2.829-2.593-3.217-4.426-.151-.717-.17-1.623-.15-7.207C.288 5.47.274 5.78.56 4.79c.142-.493.537-1.34.823-1.767C2.438 1.453 3.99.445 5.913.08c.384-.073.94-.08 6.056-.08 6.251 0 6.045-.009 7.066.314a6.807 6.807 0 0 1 4.314 4.184c.33.937.346 1.087.369 3.555l.02 2.23-.391.268c-.558.381-1.29 1.06-2.316 2.15-1.182 1.256-2.376 2.42-2.982 2.907-1.309 1.051-2.508 1.651-3.726 1.864-.634.11-1.682.067-2.302-.095-.553-.144-.517-.168-.726.464a6.355 6.355 0 0 0-.318 1.546l-.031.407-.146-.03c-1.215-.241-2.419-1.285-2.884-2.5a3.583 3.583 0 0 1-.26-1.219l-.016-.34-.309-.284c-.644-.59-1.063-1.312-1.195-2.061-.212-1.193.34-2.542 1.538-3.756 1.264-1.283 3.127-2.29 4.953-2.68.658-.14 1.818-.177 2.403-.075 1.138.198 2.067.773 2.645 1.639.182.271.195.31.177.555a.812.812 0 0 1-.183.493c-.465.651-1.848 1.348-3.336 1.68-2.625.585-4.294-.142-4.033-1.759.026-.163.04-.304.031-.313-.032-.032-.293.104-.575.3-.479.334-.903.984-1.05 1.607-.036.156-.05.406-.034.65.02.331.053.454.192.736.092.186.275.45.408.589l.24.251-.096.122a4.845 4.845 0 0 0-.677 1.217 3.635 3.635 0 0 0-.105 1.815c.103.461.421 1.095.739 1.468.242.285.797.764.886.764.024 0 .044-.048.044-.106.001-.23.184-.973.326-1.327.423-1.058 1.351-1.96 2.82-2.74.245-.13.952-.47 1.572-.757 1.36-.63 2.103-1.015 2.511-1.305 1.176-.833 1.903-2.065 2.14-3.625.086-.57.086-1.634 0-2.207-.368-2.438-2.195-4.096-4.818-4.37-2.925-.307-6.648 1.953-8.942 5.427-1.116 1.69-1.87 3.565-2.187 5.443-.123.728-.169 2.08-.093 2.75.193 1.704.822 3.078 1.903 4.156a6.531 6.531 0 0 0 1.87 1.313c2.368 1.13 4.99 1.155 7.295.071.996-.469 1.974-1.196 3.023-2.25 1.02-1.025 1.71-1.88 3.592-4.458 1.04-1.423 1.864-2.368 2.272-2.605l.15-.086-.019 3.091c-.018 2.993-.022 3.107-.123 3.561-.6 2.678-2.54 4.636-5.195 5.242l-.468.107-5.775.01c-4.734.008-5.85-.002-6.19-.056z"></path></g></svg>
              </a> <a
                href="https://www.aparat.com/Microelectronic_ir"
                className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="#ffffff" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M12.001 1.594c-9.27-.003-13.913 11.203-7.36 17.758a10.403 10.403 0 0 0 17.76-7.355c0-5.744-4.655-10.401-10.4-10.403zM6.11 6.783c.501-2.598 3.893-3.294 5.376-1.103 1.483 2.19-.422 5.082-3.02 4.582A2.97 2.97 0 0 1 6.11 6.783zm4.322 8.988c-.504 2.597-3.897 3.288-5.377 1.096-1.48-2.192.427-5.08 3.025-4.579a2.97 2.97 0 0 1 2.352 3.483zm1.26-2.405c-1.152-.223-1.462-1.727-.491-2.387.97-.66 2.256.18 2.04 1.334a1.32 1.32 0 0 1-1.548 1.053zm6.198 3.838c-.501 2.598-3.893 3.293-5.376 1.103-1.484-2.191.421-5.082 3.02-4.583a2.97 2.97 0 0 1 2.356 3.48zm-1.967-5.502c-2.598-.501-3.293-3.896-1.102-5.38 2.19-1.483 5.081.422 4.582 3.02a2.97 2.97 0 0 1-3.48 2.36zM13.59 23.264l2.264.61a3.715 3.715 0 0 0 4.543-2.636l.64-2.402a11.383 11.383 0 0 1-7.448 4.428zm7.643-19.665L18.87 2.97a11.376 11.376 0 0 1 4.354 7.62l.65-2.459A3.715 3.715 0 0 0 21.231 3.6zM.672 13.809l-.541 2.04a3.715 3.715 0 0 0 2.636 4.543l2.107.562a11.38 11.38 0 0 1-4.203-7.145zM10.357.702 8.15.126a3.715 3.715 0 0 0-4.547 2.637l-.551 2.082A11.376 11.376 0 0 1 10.358.702z"></path></g></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/20 text-center">
          <p className="text-white/70 text-sm" >
            ساخته شده توسط <a href='https://supremetech.ir/'>SupremeTech</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
