#!/bin/bash

# Trek and Stay Landing Pages Deployment Script
echo "🏔️ Trek and Stay - Landing Pages Deployment"
echo "============================================"

# Build the landing pages
echo "📦 Building landing pages..."
npm run build:landing

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Deployment Options:"
    echo "1. Netlify: Upload dist-landing folder to Netlify"
    echo "2. Vercel: Run 'vercel dist-landing'"
    echo "3. Firebase: Run 'firebase deploy --only hosting'"
    echo ""
    echo "📊 Build Statistics:"
    echo "- Output Directory: dist-landing/"
    echo "- Entry Point: index-landing.html"
    echo "- Config: vite.landing.config.ts"
    echo ""
    echo "🔗 Available Landing Pages:"
    echo "- /land/adventure-maharashtra-5days-trek"
    echo "- /land/kaalu-waterfall-harishchandragad-sandhan-valley-5d"
    echo "- /land/dudhsagar-trek-3d"
    echo "- /land/kedarnath-7d"
    echo "- /land/kumbhe-waterfall-rappelling-5d"
    echo "- /land/maharashtra-waterfall-edition-4d"
    echo "- /land/maharashtra-waterfall-edition-5d"
    echo ""
    echo "🎯 Features Included:"
    echo "✨ Crazy animations with Framer Motion"
    echo "💳 UPI payment integration"
    echo "📱 Mobile-optimized design"
    echo "🎯 Smart lead capture popups"
    echo "📞 WhatsApp integration"
    echo "🔄 Real-time Firestore data"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Deploy dist-landing folder to your hosting provider"
    echo "2. Configure your custom domain"
    echo "3. Update UPI details in the code"
    echo "4. Test payment flow"
    echo "5. Start your marketing campaigns!"
    echo ""
    echo "🚀 Ready to convert visitors into adventurers!"
else
    echo "❌ Build failed! Check the errors above."
    exit 1
fi