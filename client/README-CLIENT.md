# URL Shortener Client

A modern, responsive React application for shortening URLs with a clean and intuitive interface.

## Features

- 🚀 **Instant URL Shortening** - Convert long URLs to short, shareable links
- 🎯 **Custom Short Codes** - Create personalized short codes for your links
- 📝 **URL Descriptions** - Add descriptions to organize your links
- 📋 **One-Click Copy** - Copy shortened URLs to clipboard instantly
- 📱 **Mobile Responsive** - Works perfectly on all devices
- ✨ **Modern UI** - Clean, gradient design with smooth animations
- 🔗 **Direct Links** - Click shortened URLs to test them immediately

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- URL Shortener API server running on `http://localhost:3000`

### Installation

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and visit `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Usage

### Basic URL Shortening

1. Enter any valid URL in the "Enter URL" field
2. Optionally add a custom short code (alphanumeric only)
3. Optionally add a description for the link
4. Click "Shorten URL"
5. Copy your shortened URL using the copy button

### Custom Short Codes

- Only letters and numbers are allowed
- Must be unique (the system will show an error if already taken)
- Minimum 3 characters, maximum 20 characters

### API Integration

The client communicates with the URL Shortener API running on `http://localhost:3000`. Make sure the API server is running before using the application.

#### API Endpoints Used:
- `POST /api/urls` - Create shortened URLs

## Project Structure

```
src/
├── components/
│   ├── UrlShortener.tsx    # Main URL shortener component
│   ├── UrlShortener.css    # Component styles
│   └── ErrorBoundary.tsx   # Error handling component
├── App.tsx                 # Main app component
├── App.css                 # Global styles
├── main.tsx               # Application entry point
└── index.css              # Base CSS styles
```

## Component Features

### UrlShortener Component

- **Form Validation**: Real-time URL validation
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Clear error messages for failed requests
- **Success States**: Animated result display
- **Accessibility**: Proper labels, focus management, and keyboard navigation

### Error Handling

- **Error Boundary**: Catches and displays React errors gracefully
- **Network Errors**: Handles API connection issues
- **Validation Errors**: Shows specific field validation messages
- **User-Friendly Messages**: Clear, actionable error descriptions

## Styling

The application uses:
- **CSS Modules**: Scoped styling for components
- **Responsive Design**: Mobile-first approach
- **CSS Grid & Flexbox**: Modern layout techniques
- **Smooth Animations**: CSS transitions and keyframes
- **Accessibility**: Focus indicators and proper contrast

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Styling and animations
- **Fetch API** - HTTP requests

## Development Notes

### Environment Variables

The application currently uses hardcoded API URL (`http://localhost:3000`). For production, consider adding environment variables:

```bash
VITE_API_URL=https://your-api-domain.com
```

### Code Quality

- ESLint configuration for code consistency
- TypeScript for type safety
- Prettier for code formatting

## Troubleshooting

### Common Issues

1. **"Network error" message**
   - Ensure the API server is running on `http://localhost:3000`
   - Check CORS configuration on the API server

2. **Build fails**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

3. **Styles not loading**
   - Verify CSS import paths
   - Check for CSS syntax errors

### Development Tips

- Use browser dev tools to debug network requests
- Check console for any JavaScript errors
- Verify API responses in Network tab

## License

This project is part of the URL Shortener application suite.