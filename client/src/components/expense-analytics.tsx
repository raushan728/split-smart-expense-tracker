import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { type GroupWithStats } from "@shared/schema";

export default function ExpenseAnalytics() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { data: groups = [] } = useQuery<GroupWithStats[]>({
    queryKey: ["/api/groups"],
  });

  // Sample category data - in real app, this would come from API
  const categoryData = [
    { category: "Food & Dining", total: 4200, color: "#FB923C" },
    { category: "Transportation", total: 2800, color: "#60A5FA" },
    { category: "Shopping", total: 1950, color: "#4ADE80" },
    { category: "Entertainment", total: 1200, color: "#A78BFA" },
  ];

  const totalAmount = categoryData.reduce((sum, item) => sum + item.total, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 200;
    canvas.height = 200;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 70;

    let currentAngle = -Math.PI / 2; // Start from top

    categoryData.forEach((item) => {
      const sliceAngle = (item.total / totalAmount) * 2 * Math.PI;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Draw inner circle for doughnut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = '#1A1A2E';
    ctx.fill();

  }, [categoryData, totalAmount]);

  return (
    <>
      <Card className="glass-morphism border border-white/10">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">This Month</h3>
          
          <div className="relative h-48 mb-4 flex items-center justify-center">
            <canvas 
              ref={canvasRef}
              className="w-full h-full max-w-[200px] max-h-[200px]"
            />
          </div>

          <div className="space-y-3">
            {categoryData.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-300">{item.category}</span>
                </div>
                <span className="text-sm font-mono text-white">₹{item.total.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => console.log('Analytics page - coming soon!')}
            variant="outline" 
            className="w-full mt-4 glass-morphism border border-white/10 hover:glass-morphism-purple transition-all duration-300"
          >
            View Detailed Analytics
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-morphism border border-white/10">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mt-0.5">
                <span className="text-green-400 text-xs">+</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">Raushan added "Beach Restaurant Dinner"</p>
                <p className="text-gray-400 text-xs">₹2,400 • Goa Trip • 2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mt-0.5">
                <span className="text-blue-400 text-xs">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">You settled up with Priya</p>
                <p className="text-gray-400 text-xs">₹125 • Team Lunch • 1 day ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mt-0.5">
                <span className="text-purple-400 text-xs">👥</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">Maya joined "Roommates - Apartment 3B"</p>
                <p className="text-gray-400 text-xs">2 days ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center mt-0.5">
                <span className="text-yellow-400 text-xs">✏️</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">You updated "Grocery Shopping"</p>
                <p className="text-gray-400 text-xs">₹850 • Roommates • 3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
