# Invoice Generator Web App

A professional, freelancer/business-friendly web application that generates branded invoices with comprehensive features for managing client relationships and business finances.

## 🚀 Key Features

- **Professional Invoice Generation**: Create branded invoices with customizable templates
- **Client Management**: Store and manage client information and service details
- **Branding & Customization**: Add your logo, colors, and company information
- **Multiple Export Options**: Download as PDF or send directly via email
- **Invoice History**: Save and track all generated invoices
- **User Authentication**: Secure login system for invoice management
- **Auto-Email**: Automatically send invoices to clients
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **React Hook Form** - Form handling and validation
- **Zustand** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **JWT** - Authentication and authorization
- **Multer** - File upload handling
- **Nodemailer** - Email functionality

### Database
- **SQLite** - Lightweight database (development)
- **PostgreSQL** - Production database (optional)
- **Prisma** - Database ORM

### PDF Generation
- **jsPDF** - Client-side PDF generation
- **pdfmake** - Server-side PDF generation
- **HTML-to-PDF** - Template-based PDF creation

## 📁 Project Structure

```
invoice-generator-web-app/
├── frontend/          # Next.js frontend application
├── backend/           # Node.js/Express backend
├── docs/             # Project documentation
├── README.md         # This file
├── package.json      # Root package.json for scripts
└── docker-compose.yml # Docker setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `.env` files in both frontend and backend directories:

**Backend (.env):**
```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=file:./dev.db
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Invoice Generator
```

## 🔧 Configuration

The application can be configured through environment variables. See the configuration section in each service for detailed options.

## 📝 API Documentation

Once the backend is running, visit `http://localhost:5000/api-docs` for interactive API documentation.

## 🎨 Invoice Templates

The app includes several professional invoice templates:
- **Modern**: Clean, minimalist design
- **Classic**: Traditional business layout
- **Creative**: Artistic, brand-focused design
- **Corporate**: Professional enterprise style

## 📧 Email Features

- **Invoice Delivery**: Send invoices directly to clients
- **Reminder System**: Automated payment reminders
- **Custom Templates**: Personalized email messages
- **Delivery Tracking**: Monitor email delivery status

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Secure file uploads

## 📱 Responsive Design

- Mobile-first approach
- Progressive Web App (PWA) features
- Touch-friendly interface
- Cross-browser compatibility

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up --build
```

### Manual Deployment
1. Build the frontend: `npm run build`
2. Set production environment variables
3. Start the backend server
4. Configure your web server (nginx, Apache)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.

## 🎯 Roadmap

- [ ] Multi-currency support
- [ ] Recurring invoices
- [ ] Payment integration (Stripe, PayPal)
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] API rate limiting and usage tracking
- [ ] Multi-language support
- [ ] Advanced template editor
