import type { ItineraryAiPort } from '../../application/ports/itinerary-ai.port';
import type { ItineraryPlan, ItineraryGenerationParams, DaySchedule, ActivitySlot } from '../../domain/itinerary/entity';

export class SmartItineraryAdapter implements ItineraryAiPort {
  public readonly providerName = 'traveling-smart-engine';

  async isAvailable(): Promise<boolean> {
    return true; // Always available offline and online
  }

  async generate(params: ItineraryGenerationParams): Promise<ItineraryPlan> {
    const { destination, days, budgetRange, travelStyle } = params;
    const budgetMultiplier = budgetRange === 'premium' ? 2.5 : budgetRange === 'budget' ? 0.7 : 1.2;
    const daysList: DaySchedule[] = [];
    let grandTotal = 0;

    const activityDatabase = {
      morning: [
        { title: 'Thưởng thức cà phê và điểm tâm đặc sản địa phương', desc: 'Trải nghiệm không gian ẩm thực sáng truyền thống được người dân bản địa yêu thích nhất.', spend: 8 },
        { title: 'Tham quan di tích lịch sử và đền thờ cổ kính', desc: 'Tìm hiểu kiến trúc nguyên bản và lịch sử văn hóa ngàn năm với hướng dẫn viên kỹ thuật số.', spend: 15 },
        { title: 'Dạo bước qua quảng trường biểu tượng và chợ sớm', desc: 'Không khí nhộn nhịp ban mai, chụp những bức ảnh kiến trúc tuyệt đẹp khi nắng sớm vừa lên.', spend: 5 },
      ],
      afternoon: [
        { title: 'Bảo tàng Nghệ thuật và Triển lãm Không gian số', desc: 'Chiêm ngưỡng các kiệt tác nghệ thuật độc bản và trải nghiệm tương tác thực tế ảo ánh sáng.', spend: 22 },
        { title: 'Khám phá khu phố mua sắm thủ công và thời trang', desc: 'Tìm kiếm những món quà lưu niệm độc đáo và đồ lưu niệm thủ công tinh xảo.', spend: 30 },
        { title: 'Trải nghiệm văn hóa trà đạo và workshop truyền thống', desc: 'Tự tay pha chế và thưởng thức hương vị đặc trưng dưới sự chỉ dẫn của nghệ nhân.', spend: 20 },
      ],
      evening: [
        { title: 'Thưởng thức bữa tối ẩm thực cao cấp phong cách bản địa', desc: 'Bữa ăn thịnh soạn kết hợp nguyên liệu tươi ngon nhất cùng tầm nhìn ngoạn mục thành phố.', spend: 35 },
        { title: 'Ngắm toàn cảnh hoàng hôn từ đài quan sát trên cao', desc: 'Chiêm ngưỡng toàn cảnh đô thị rực rỡ khi ánh đèn bắt đầu bừng sáng trong đêm.', spend: 18 },
        { title: 'Khám phá chợ đêm ẩm thực đường phố và biểu diễn nghệ thuật', desc: 'Thưởng thức các món ăn vặt trứ danh và hòa mình vào không khí lễ hội về đêm.', spend: 15 },
      ],
    };

    for (let d = 1; d <= days; d++) {
      const morningAct = activityDatabase.morning[(d - 1) % activityDatabase.morning.length];
      const afternoonAct = activityDatabase.afternoon[(d - 1) % activityDatabase.afternoon.length];
      const eveningAct = activityDatabase.evening[(d - 1) % activityDatabase.evening.length];

      const s1: ActivitySlot = {
        id: `day-${d}-slot-1`,
        day: d,
        startTime: '08:30',
        endTime: '11:00',
        title: morningAct.title,
        description: `${morningAct.desc} (Phong cách: ${travelStyle})`,
        estimatedSpend: Math.round(morningAct.spend * budgetMultiplier),
      };

      const s2: ActivitySlot = {
        id: `day-${d}-slot-2`,
        day: d,
        startTime: '13:30',
        endTime: '16:30',
        title: afternoonAct.title,
        description: afternoonAct.desc,
        estimatedSpend: Math.round(afternoonAct.spend * budgetMultiplier),
      };

      const s3: ActivitySlot = {
        id: `day-${d}-slot-3`,
        day: d,
        startTime: '18:00',
        endTime: '21:00',
        title: eveningAct.title,
        description: eveningAct.desc,
        estimatedSpend: Math.round(eveningAct.spend * budgetMultiplier),
      };

      const dayTotal = s1.estimatedSpend + s2.estimatedSpend + s3.estimatedSpend;
      grandTotal += dayTotal;

      daysList.push({
        day: d,
        title: `Ngày ${d}: Khám phá tinh hoa ${destination}`,
        totalEstimatedSpend: dayTotal,
        slots: [s1, s2, s3],
      });
    }

    return {
      id: `itinerary-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      destination,
      budgetRange,
      totalEstimatedSpend: grandTotal,
      days: daysList,
      currency: 'USD',
      generatedAt: new Date().toISOString(),
    };
  }
}
