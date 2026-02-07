echo "STarting backend"
python3 backend/app.py &

echo "STarting frontend"
cd frontend npm run dev
