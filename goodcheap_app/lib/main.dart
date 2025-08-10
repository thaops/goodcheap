import 'package:flutter/material.dart';

import 'dart:async';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: const ProductAnalysisPage(),
    );
  }
}


class ProductAnalysisPage extends StatefulWidget {
  const ProductAnalysisPage({Key? key}) : super(key: key);

  @override
  State<ProductAnalysisPage> createState() => _ProductAnalysisPageState();
}

class _ProductAnalysisPageState extends State<ProductAnalysisPage> {
  // ---- Data: bám đúng cấu trúc JSON đã gửi ----
  final Map<String, dynamic> data = {
    "schemaVersion": "1.0.0",
    "meta": {
      "locale": "vi-VN",
      "currency": "VND",
      "timestamp": "2025-08-10T10:32:44.730Z",
      "platform": "tiktok",
      "productId": "1731229103169571477",
    },
    "product": {
      "title":
          "HQAi H12 - Tai nghe Bluetooth không dây tích hợp MIC, chống nước, dùng cho iPhone và Android, cảm ứng chạm, chống ồn, âm thanh stereo Hi-Fi 3 quà tặng (dây buộc miễn phí+tay áo trò chơi+nhãn dán)",
      "canonicalUrl": "https://www.tiktok.com/view/product/1731229103169571477",
      "images": [
        {
          "url":
              "https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/902e5f48ac3e4094952d9c3fcb90135b~tplv-aphluv4xwc-resize-webp:260:260.webp?dr=15582&t=555f072d&ps=933b5bde&shp=7745054a&shcp=9b759fb9&idc=my&from=2001012042"
        },
      ],
      "seller": {},
      "specs": {},
      "claims": <String>[],
    },
    "aiAnalysis": {
      "model": "gemini-2.5-flash",
      "method": ["rubric-scoring", "aspect-sentiment"],
      "hallucinationRisk": "medium",
      "biasNotes": "Nguồn sản phẩm có thiên vị; đã yêu cầu evidence cho pros/cons.",
      "limitations": "Không phải phép đo lab; phụ thuộc dữ liệu công khai.",
      "citations": [
        {"evidenceId": "prod:page", "note": "Nguồn tham chiếu"}
      ],
      "confidenceDrivers": [
        "Chỉ có trang bán, thiếu review độc lập",
        "Một số pros/cons thiếu evidence"
      ],
    },
    "evidence": [
      {
        "id": "prod:page",
        "type": "productPage",
        "source": "tiktok",
        "url":
            "https://www.tiktok.com/view/product/1731229103169571477?_svg=1&checksum=99f9959be5128f035400d143a26ef53906a888a80c1b17480cca85c796290cfc&encode_params=...",
        "fetchedAt": "2025-08-10T10:32:44.730Z",
        "reliability": 0.6,
        "notes": "Trang sản phẩm, có khả năng thiên vị."
      }
    ],
    "rubric": {
      "weights": {
        "soundQuality": 0.25,
        "battery": 0.15,
        "micCall": 0.15,
        "noiseControl": 0.1,
        "comfortFit": 0.1,
        "durability": 0.1,
        "connectivity": 0.1,
        "warrantySupport": 0.05
      },
      "scoringScale": "0-5",
      "formula": "overall = SUM((score/5)*weight) * 100",
    },
    "aspects": [
      {
        "name": "overview",
        "label": "Tổng quan",
        "metrics": [
          {
            "key": "valueForMoney",
            "label": "Giá trị/giá",
            "direction": "higherBetter",
            "unit": "ratio",
            "target": {"value": 0.7, "unit": "ratio"},
            "applicability": "applicable"
          }
        ],
        "confidence": 0.55,
        "pros": [
          "Thiết kế không dây tiện lợi với điều khiển cảm ứng",
          "Tích hợp micro và khả năng chống nước",
          "Tương thích rộng rãi với cả iPhone và Android",
          "Hỗ trợ âm thanh Hi-Fi stereo và tính năng chống ồn",
          "Kèm theo 3 quà tặng miễn phí",
        ],
        "cons": [
          "Chất lượng chống ồn có thể không cao cấp (có thể)",
          "Thời lượng pin không được đề cập, có thể hạn chế (có thể)",
          "Độ bền và chất lượng hoàn thiện chưa rõ (có thể)",
          "Sự thoải mái khi đeo lâu chưa được xác nhận (có thể)",
          "Chất lượng âm thanh Hi-Fi cần được kiểm chứng thực tế (có thể)",
        ],
        "prosDetailed": [
          {"text": "Thiết kế không dây tiện lợi với điều khiển cảm ứng"},
          {"text": "Tích hợp micro và khả năng chống nước"},
          {"text": "Tương thích rộng rãi với cả iPhone và Android"},
          {"text": "Hỗ trợ âm thanh Hi-Fi stereo và tính năng chống ồn"},
          {"text": "Kèm theo 3 quà tặng miễn phí"}
        ],
        "consDetailed": [
          {"text": "Chất lượng chống ồn có thể không cao cấp (có thể)"},
          {"text": "Thời lượng pin không được đề cập, có thể hạn chế (có thể)"},
          {"text": "Độ bền và chất lượng hoàn thiện chưa rõ (có thể)"},
          {"text": "Sự thoải mái khi đeo lâu chưa được xác nhận (có thể)"},
          {"text": "Chất lượng âm thanh Hi-Fi cần được kiểm chứng thực tế (có thể)"}
        ],
        "risks": [],
        "improvements": [],
        "fitFor": [],
        "tradeOffs": [],
        "evidenceIds": [],
        "quotes": [],
      },
      {
        "name": "soundQuality",
        "label": "Chất lượng âm thanh",
        "metrics": [
          {
            "key": "detail",
            "label": "Chi tiết/độ tách lớp",
            "direction": "higherBetter",
            "unit": "ratio",
            "target": {"value": 0.7, "unit": "ratio"},
            "applicability": "applicable"
          },
          {
            "key": "bassControl",
            "label": "Kiểm soát bass",
            "direction": "higherBetter",
            "unit": "ratio",
            "target": {"value": 0.6, "unit": "ratio"},
            "applicability": "applicable"
          },
        ],
        "pros": [],
        "cons": [],
        "evidenceIds": [],
        "confidence": 0.5
      },
      {
        "name": "battery",
        "label": "Thời lượng pin",
        "metrics": [
          {
            "key": "playbackHours",
            "label": "Giờ nghe",
            "direction": "higherBetter",
            "unit": "hour",
            "target": {"value": 6, "unit": "hour"},
            "applicability": "applicable"
          }
        ],
        "pros": [],
        "cons": [],
        "evidenceIds": [],
        "confidence": 0.5
      },
      {
        "name": "micCall",
        "label": "Đàm thoại/MIC",
        "metrics": [
          {
            "key": "clarity",
            "label": "Độ rõ MIC",
            "direction": "higherBetter",
            "unit": "ratio",
            "target": {"value": 0.7, "unit": "ratio"},
            "applicability": "applicable"
          }
        ],
        "pros": [],
        "cons": [],
        "evidenceIds": [],
        "confidence": 0.5
      },
      {
        "name": "noiseControl",
        "label": "Chống ồn",
        "metrics": [
          {
            "key": "ancDepth",
            "label": "Độ triệt ồn (dB)",
            "direction": "higherBetter",
            "unit": "dB",
            "target": {"value": 20, "unit": "dB"},
            "applicability": "unknown"
          }
        ],
        "pros": [],
        "cons": [],
        "evidenceIds": [],
        "confidence": 0.5
      },
      {
        "name": "comfortFit",
        "label": "Đeo/thoải mái",
        "metrics": [
          {
            "key": "comfort",
            "label": "Độ thoải mái",
            "direction": "higherBetter",
            "unit": "ratio",
            "target": {"value": 0.7, "unit": "ratio"},
            "applicability": "applicable"
          }
        ],
        "pros": [],
        "cons": [],
        "evidenceIds": [],
        "confidence": 0.5
      },
      {
        "name": "durability",
        "label": "Độ bền",
        "metrics": [
          {
            "key": "ipRating",
            "label": "Chuẩn IP",
            "direction": "matchBetter",
            "unit": "ip",
            "target": ["IPX4", "IP55"],
            "applicability": "applicable"
          }
        ],
        "pros": [],
        "cons": [],
        "evidenceIds": [],
        "confidence": 0.5
      },
      {
        "name": "connectivity",
        "label": "Kết nối",
        "metrics": [
          {
            "key": "latency",
            "label": "Độ trễ (ms)",
            "direction": "lowerBetter",
            "unit": "ms",
            "target": {"value": 100, "unit": "ms"},
            "applicability": "applicable"
          },
          {
            "key": "codec",
            "label": "Codec",
            "direction": "matchBetter",
            "unit": "set",
            "target": ["AAC", "aptX"],
            "applicability": "applicable"
          },
        ],
        "pros": [],
        "cons": [],
        "evidenceIds": [],
        "confidence": 0.5
      },
      {
        "name": "warrantySupport",
        "label": "Bảo hành/Hỗ trợ",
        "metrics": [
          {
            "key": "warrantyMonths",
            "label": "Bảo hành (tháng)",
            "direction": "higherBetter",
            "unit": "month",
            "target": {"value": 12, "unit": "month"},
            "applicability": "applicable"
          }
        ],
        "pros": [],
        "cons": [],
        "evidenceIds": [],
        "confidence": 0.5
      },
    ],
    "scoring": {
      "aspectScores": [
        {"name": "overview", "weight": 0, "evidenceIds": <String>[]},
        {"name": "soundQuality", "weight": 0.25, "evidenceIds": <String>[]},
        {"name": "battery", "weight": 0.15, "evidenceIds": <String>[]},
        {"name": "micCall", "weight": 0.15, "evidenceIds": <String>[]},
        {"name": "noiseControl", "weight": 0.1, "evidenceIds": <String>[]},
        {"name": "comfortFit", "weight": 0.1, "evidenceIds": <String>[]},
        {"name": "durability", "weight": 0.1, "evidenceIds": <String>[]},
        {"name": "connectivity", "weight": 0.1, "evidenceIds": <String>[]},
        {"name": "warrantySupport", "weight": 0.05, "evidenceIds": <String>[]},
      ],
    },
    "analysis": {
      "overallScore": 50,
      "confidence": 0.7,
      "topDrivers": [
        {"name": "soundQuality"},
        {"name": "battery"},
        {"name": "micCall"}
      ],
      "summary":
          "Tai nghe HQAi H12 là lựa chọn không dây đa năng với nhiều tính năng như chống nước, chống ồn, âm thanh Hi-Fi và tương thích rộng rãi. Tuy nhiên, do thiếu đánh giá từ người dùng, hiệu suất thực tế của các tính năng cao cấp và độ bền sản phẩm cần được kiểm chứng thêm.",
      "coverage": {}
    },
    "decision": {
      "verdict": "hold",
      "reasons": [
        "Không có dữ liệu sản phẩm được cung cấp để đưa ra quyết định chi tiết.",
        "Vui lòng cung cấp thông tin về sản phẩm (ví dụ: giá, tính năng, đánh giá, điểm số tổng thể, rủi ro) để có thể đưa ra lời khuyên chính xác hơn."
      ],
      "nextChecks": <String>[]
    },
    "dataIntegrity": {
      "status": "invalid",
      "issues": [
        {
          "code": "missing_evidence",
          "severity": "medium",
          "message": "Pros/cons thiếu evidenceIds",
          "paths": ["\$.aspects[*].pros", "\$.aspects[*].cons"]
        },
        {
          "code": "mixed_target_types",
          "severity": "low",
          "message": "Target có nhiều kiểu trong connectivity",
          "paths": ["\$.aspects[name=connectivity].metrics[*].target"]
        },
        {
          "code": "buy_url_has_tracking",
          "severity": "low",
          "message": "buyUrl chứa tham số tracking",
          "paths": ["\$.actions.buyUrl"]
        },
      ],
      "recommendation": "Set verdict='hold' cho đến khi sửa dữ liệu và bổ sung evidence.",
      "coverage": {
        "requiredAspects": [
          "overview",
          "soundQuality",
          "battery",
          "micCall",
          "noiseControl",
          "comfortFit",
          "durability",
          "connectivity",
          "warrantySupport"
        ],
        "presentAspects": [
          "overview",
          "soundQuality",
          "battery",
          "micCall",
          "noiseControl",
          "comfortFit",
          "durability",
          "connectivity",
          "warrantySupport"
        ]
      }
    },
    "statusMessage": {
      "userFriendly":
          "Dữ liệu hiện chưa nhất quán nên chúng tôi tạm dừng khuyến nghị mua. Sẽ cập nhật khi xác minh xong.",
      "technical":
          "DataIntegrityError: missing_evidence, mixed_target_types, buy_url_has_tracking"
    },
    "actions": {
      "alerts": [
        {"type": "priceDrop", "thresholdPercent": 10, "currency": "VND", "platform": "tiktok"},
        {"type": "ratingCount", "minCount": 300, "minAvg": 4.2},
      ],
      "buyUrl":
          "https://www.tiktok.com/view/product/1731229103169571477?_svg=1&checksum=...&utm_source=copy"
    }
  };

  bool copied = false;
  bool imgFailed = false;

  // ---- Helpers ----
  Map<String, dynamic> _platformBadge(String? platform) {
    final p = (platform ?? '').toLowerCase();
    if (p == 'tiktok') {
      return {
        "label": "TikTok Shop",
        "bg": Colors.black,
        "fg": Colors.white,
        "icon": Icons.star
      };
    }
    return {"label": platform ?? "Unknown", "bg": const Color(0xFF111827), "fg": Colors.white, "icon": Icons.info};
  }

  Color _scoreColor(num score) {
    if (score >= 70) return const Color(0xFF10B981); // emerald-500
    if (score >= 40) return const Color(0xFFF59E0B); // amber-500
    return const Color(0xFFEF4444); // red-500
  }

  String _formatTarget(dynamic target) {
    if (target is List) return target.join(", ");
    if (target is Map && target.containsKey('value')) {
      final unit = (target['unit'] ?? '').toString();
      return "${target['value']} ${unit}".trim();
    }
    if (target is String || target is num) return target.toString();
    return "—";
  }

  num _getWeight(String name) {
    final weights = (data['rubric']?['weights'] ?? {}) as Map;
    if (weights[name] is num) return weights[name] as num;
    final aspectScores = (data['scoring']?['aspectScores'] ?? []) as List;
    for (final a in aspectScores) {
      final m = a as Map;
      if (m['name'] == name && m['weight'] is num) return m['weight'] as num;
    }
    return 0;
    }

  String _humanVerdict(String? verdict) {
    switch ((verdict ?? '').toLowerCase()) {
      case 'buy':
        return 'Nên mua';
      case 'hold':
        return 'Chờ thêm';
      case 'avoid':
        return 'Không khuyến nghị';
      default:
        return verdict ?? '—';
    }
  }

  // severity -> màu nền/border/icon
  ({Color bg, Color border, IconData icon, Color iconColor}) _severityStyle(String sev) {
    final s = sev.toLowerCase();
    if (s == 'high' || s == 'critical') {
      return (bg: const Color(0xFFFFF1F2), border: const Color(0xFFFECACA), icon: Icons.shield, iconColor: Colors.red);
    }
    if (s == 'medium') {
      return (bg: const Color(0xFFFFF7ED), border: const Color(0xFFFDE68A), icon: Icons.warning, iconColor: Colors.amber);
    }
    return (bg: const Color(0xFFF9FAFB), border: const Color(0xFFE5E7EB), icon: Icons.info, iconColor: Colors.grey);
  }

  String _cleanBuyUrl() {
    try {
      final product = (data['product'] ?? {}) as Map;
      final canonical = product['canonicalUrl']?.toString();
      if (canonical != null && canonical.isNotEmpty) return canonical;
      final raw = (data['actions']?['buyUrl'] ?? '').toString();
      final uri = Uri.parse(raw);
      return Uri(scheme: uri.scheme, host: uri.host, path: uri.path).toString();
    } catch (_) {
      return (data['actions']?['buyUrl'] ?? '').toString();
    }
  }

  Future<void> _copyCleanUrl() async {
    final cleanUrl = _cleanBuyUrl();
    await Clipboard.setData(ClipboardData(text: cleanUrl));
    if (mounted) {
      setState(() => copied = true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã sao chép link sạch')),
      );
      Timer(const Duration(milliseconds: 1500), () {
        if (mounted) setState(() => copied = false);
      });
    }
  }

Future<void> _open(String url) async {
  final uri = Uri.parse(url.startsWith('http') ? url : 'https://$url');

  if (await launchUrl(uri, mode: LaunchMode.externalApplication)) return;
  if (await launchUrl(uri, mode: LaunchMode.inAppBrowserView)) return;
  if (await launchUrl(uri, mode: LaunchMode.inAppWebView)) return;

  if (mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Không mở được liên kết: $url')),
    );
  }
}


  // ---- UI ----

  @override
  Widget build(BuildContext context) {
    final meta = (data['meta'] ?? {}) as Map<String, dynamic>;
    final product = (data['product'] ?? {}) as Map<String, dynamic>;
    final actions = (data['actions'] ?? {}) as Map<String, dynamic>;
    final analysis = (data['analysis'] ?? {}) as Map<String, dynamic>;
    final decision = (data['decision'] ?? {}) as Map<String, dynamic>;
    final dataIntegrity = (data['dataIntegrity'] ?? {}) as Map<String, dynamic>;
    final aiAnalysis = (data['aiAnalysis'] ?? {}) as Map<String, dynamic>;

    final platform = _platformBadge(meta['platform']?.toString());
    final productId = meta['productId']?.toString() ?? '—';
    final timestamp = DateTime.tryParse(meta['timestamp']?.toString() ?? '');
    final dateStr = timestamp != null
        ? "${timestamp.toLocal().day.toString().padLeft(2, '0')}/${timestamp.toLocal().month.toString().padLeft(2, '0')}/${timestamp.toLocal().year}"
        : '—';

    final List images = (product['images'] ?? []) as List;
    final String? imgUrl = images.isNotEmpty ? ((images.first as Map)['url']?.toString()) : null;

    final aspects = (data['aspects'] ?? []) as List;
    final overview = aspects.cast<Map>().firstWhere(
          (a) => a['name'] == 'overview',
          orElse: () => {},
        );
    final featureAspects = aspects.cast<Map>().where((a) => a['name'] != 'overview').toList();

    final List topDrivers = ((analysis['topDrivers'] ?? []) as List).map((e) => (e as Map)['name']).toList();

    final overallScore = (analysis['overallScore'] ?? 0) as num;
    final confidence = (analysis['confidence'] ?? 0) as num;

    final verdict = decision['verdict']?.toString();

    final buyUrl = actions['buyUrl']?.toString() ?? '';
    final cleanUrl = _cleanBuyUrl();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0.6,
        centerTitle: false,
        backgroundColor: Colors.white.withOpacity(0.9),
        foregroundColor: Colors.black,
        titleSpacing: 0,
        title: Padding(
          padding: const EdgeInsets.only(left: 8),
          child: Row(
            children: [
              _Badge(
                bg: platform['bg'] as Color,
                fg: platform['fg'] as Color,
                child: Row(
                  children: [
                    Icon(platform['icon'] as IconData, size: 14, color: platform['fg'] as Color),
                    const SizedBox(width: 6),
                    Text(
                      platform['label'] as String,
                      style: TextStyle(color: platform['fg'] as Color, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text("ID: $productId", style: const TextStyle(fontSize: 12, color: Colors.black54)),
              const Spacer(),
              Text(dateStr, style: const TextStyle(fontSize: 12, color: Colors.black54)),
              const SizedBox(width: 12),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.95),
          border: const Border(top: BorderSide(color: Color(0xFFE5E7EB))),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: SafeArea(
          top: false,
          child: Row(
            children: [
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product['title']?.toString() ?? '—',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      "${_humanVerdict(verdict)} • Điểm $overallScore/100",
                      style: const TextStyle(fontSize: 12, color: Colors.black54),
                    ),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: () => _open(buyUrl),
                icon: const Icon(Icons.shopping_bag_outlined, size: 18),
                label: const Text("Mua ngay"),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        child: Column(
          children: [
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Color(0xFFE5E7EB))),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image
                  Stack(
                    children: [
                      ClipRRect(
                        borderRadius: const BorderRadius.only(topLeft: Radius.circular(12), topRight: Radius.circular(12)),
                        child: AspectRatio(
                          aspectRatio: 1.4,
                          child: imgFailed || imgUrl == null
                              ? Container(
                                  color: const Color(0xFFF3F4F6),
                                  child: const Center(child: Icon(Icons.image_outlined, size: 48, color: Colors.black26)),
                                )
                              : Image.network(
                                  imgUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) {
                                    setState(() => imgFailed = true);
                                    return Container(
                                      color: const Color(0xFFF3F4F6),
                                      child: const Center(child: Icon(Icons.image_not_supported_outlined, size: 48, color: Colors.black26)),
                                    );
                                  },
                                ),
                        ),
                      ),
                      Positioned(
                        left: 8,
                        top: 8,
                        child: _Badge(
                          bg: const Color(0xFFD1FAE5),
                          fg: const Color(0xFF047857),
                          child: const Text("Bluetooth • Chống nước", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        ),
                      ),
                    ],
                  ),

                  Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(product['title']?.toString() ?? '—', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, height: 1.2)),
                        const SizedBox(height: 12),

                        // Score + drivers
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            _ScoreRing(score: overallScore.toDouble(), size: 72, fg: _scoreColor(overallScore)),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text("Điểm tổng thể", style: TextStyle(fontSize: 12, color: Colors.black54)),
                                  Text("Mức tin cậy: ${(confidence * 100).toStringAsFixed(0)}%", style: const TextStyle(fontSize: 13)),
                                  if (topDrivers.isNotEmpty) const SizedBox(height: 6),
                                  if (topDrivers.isNotEmpty)
                                    Wrap(
                                      spacing: 6,
                                      runSpacing: 6,
                                      children: topDrivers.map((n) {
                                        final Map? aspect = aspects.cast<Map?>().firstWhere(
                                          (a) => a?['name'] == n,
                                          orElse: () => null,
                                        );
                                        final label = (aspect?['label'] ?? n).toString();
                                        return _Badge(
                                          bg: const Color(0xFFF3F4F6),
                                          fg: Colors.black87,
                                          child: Text(label, style: const TextStyle(fontSize: 10)),
                                        );
                                      }).toList(),
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 12),

                        // Verdict alert
                        if (verdict != null && verdict.isNotEmpty)
                          Builder(builder: (context) {
                            if (verdict.toLowerCase() == 'hold') {
                              return _AlertBox(
                                icon: Icons.warning_amber_rounded,
                                title: _humanVerdict(verdict),
                                description: (data['statusMessage']?['userFriendly'] ?? '').toString(),
                                bg: const Color(0xFFFFF7ED),
                                border: const Color(0xFFFDE68A),
                                iconColor: Colors.amber[800]!,
                              );
                            }
                            return _AlertBox(
                              icon: Icons.info,
                              title: _humanVerdict(verdict),
                              description: (decision['reasons'] as List?)?.isNotEmpty == true
                                  ? ((decision['reasons'] as List).first).toString()
                                  : "",
                            );
                          }),

                        const SizedBox(height: 12),

                        // Buttons
                        Row(
                          children: [
                            Expanded(
                              flex: 3,
                              child: ElevatedButton.icon(
                                onPressed: () => _open(buyUrl),
                                icon: const Icon(Icons.shopping_bag_outlined, size: 18),
                                label: const Text("Mua trên TikTok"),
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              flex: 2,
                              child: OutlinedButton.icon(
                                onPressed: () => _open(cleanUrl),
                                icon: const Icon(Icons.link, size: 18),
                                label: const Text("Link sạch"),
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              flex: 2,
                              child: OutlinedButton.icon(
                                onPressed: _copyCleanUrl,
                                icon: const Icon(Icons.copy, size: 18),
                                label: Text(copied ? "Đã sao chép" : "Sao chép"),
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 14),
                        const Divider(height: 1),

                        // Pros / Cons
                        if (overview.isNotEmpty) ...[
                          const SizedBox(height: 12),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: _ProsConsSection(
                                  title: "Ưu điểm",
                                  icon: Icons.check_circle_rounded,
                                  iconColor: const Color(0xFF059669),
                                  items: ((overview['prosDetailed'] ?? []) as List).map((e) => (e as Map)['text']?.toString() ?? '').toList(),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _ProsConsSection(
                                  title: "Nhược điểm",
                                  icon: Icons.shield,
                                  iconColor: const Color(0xFFE11D48),
                                  items: ((overview['consDetailed'] ?? []) as List).map((e) => (e as Map)['text']?.toString() ?? '').toList(),
                                ),
                              ),
                            ],
                          ),
                        ],

                        const SizedBox(height: 14),
                        const Divider(height: 1),

                        // Aspects + metrics
                        const SizedBox(height: 12),
                        const Text("Khía cạnh & trọng số", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        Column(
                          children: featureAspects.map((aspect) {
                            final weight = _getWeight(aspect['name']?.toString() ?? '');
                            final confidence = (aspect['confidence'] ?? 0) as num;
                            final bool isDriver = topDrivers.contains(aspect['name']);
                            final metrics = (aspect['metrics'] ?? []) as List;
                            return _AccordionTile(
                              title: aspect['label']?.toString() ?? aspect['name']?.toString() ?? '—',
                              subtitle: "Trọng số: ${(weight * 100).toStringAsFixed(0)}% • Tin cậy ${(confidence * 100).toStringAsFixed(0)}%",
                              trailingChip: isDriver ? "Tác động chính" : null,
                              child: Column(
                                children: metrics.map((m) {
                                  final mm = m as Map;
                                  return Container(
                                    margin: const EdgeInsets.only(bottom: 8),
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF9FAFB),
                                      border: Border.all(color: const Color(0xFFE5E7EB)),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Text(
                                                mm['label']?.toString() ?? '—',
                                                style: const TextStyle(fontWeight: FontWeight.w600),
                                              ),
                                            ),
                                            _Badge(
                                              bg: const Color(0xFFF3F4F6),
                                              fg: Colors.black87,
                                              child: Text(mm['direction']?.toString() ?? '', style: const TextStyle(fontSize: 10)),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        Text("Mục tiêu: ${_formatTarget(mm['target'])}", style: const TextStyle(fontSize: 12, color: Colors.black54)),
                                        const SizedBox(height: 2),
                                        Text("Áp dụng: ${mm['applicability']?.toString() ?? '—'}", style: const TextStyle(fontSize: 12, color: Colors.black54)),
                                      ],
                                    ),
                                  );
                                }).toList(),
                              ),
                            );
                          }).toList(),
                        ),

                        const SizedBox(height: 14),
                        const Divider(height: 1),

                        // Data Integrity
                        const SizedBox(height: 12),
                        const Text("Tính toàn vẹn dữ liệu", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        Column(
                          children: ((dataIntegrity['issues'] ?? []) as List).asMap().entries.map((entry) {
                            final iss = (entry.value as Map);
                            final style = _severityStyle(iss['severity']?.toString() ?? '');
                            final paths = (iss['paths'] ?? []) as List;
                            return Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: style.bg,
                                border: Border.all(color: style.border),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Icon(style.icon, size: 18, color: style.iconColor),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(iss['code']?.toString() ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
                                        const SizedBox(height: 2),
                                        Text(iss['message']?.toString() ?? '', style: const TextStyle(color: Colors.black54)),
                                        if (paths.isNotEmpty) ...[
                                          const SizedBox(height: 4),
                                          Text("Vị trí: ${paths.join(' • ')}", style: const TextStyle(fontSize: 12, color: Colors.black54)),
                                        ],
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                        if ((dataIntegrity['recommendation'] ?? '').toString().isNotEmpty)
                          Container(
                            margin: const EdgeInsets.only(top: 8),
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text("Gợi ý: ${dataIntegrity['recommendation']}", style: const TextStyle(fontSize: 12, color: Color(0xFF334155))),
                          ),

                        const SizedBox(height: 14),
                        const Divider(height: 1),

                        // Alerts
                        const SizedBox(height: 12),
                        const Text("Theo dõi & Cảnh báo", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        Column(
                          children: ((actions['alerts'] ?? []) as List).map((a) {
                            final aa = a as Map;
                            String subtitle = '';
                            if (aa['type'] == 'priceDrop') {
                              subtitle = "Ngưỡng: -${aa['thresholdPercent']}% • ${aa['currency']}";
                            } else if (aa['type'] == 'ratingCount') {
                              subtitle = "Khi ≥ ${aa['minCount']} đánh giá, điểm trung bình ≥ ${aa['minAvg']}";
                            }
                            return Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                border: Border.all(color: const Color(0xFFE5E7EB)),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          aa['type'] == 'priceDrop'
                                              ? 'Giảm giá'
                                              : aa['type'] == 'ratingCount'
                                                  ? 'Đánh giá'
                                                  : (aa['type']?.toString() ?? ''),
                                          style: const TextStyle(fontWeight: FontWeight.w600),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(subtitle, style: const TextStyle(fontSize: 12, color: Colors.black54)),
                                      ],
                                    ),
                                  ),
                                  const _Badge(bg: Color(0xFFF3F4F6), fg: Colors.black87, child: Text("Bản xem trước", style: TextStyle(fontSize: 10))),
                                ],
                              ),
                            );
                          }).toList(),
                        ),

                        const SizedBox(height: 14),
                        const Divider(height: 1),

                        // AI Analysis
                        const SizedBox(height: 12),
                        const Text("Phân tích AI", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            border: Border.all(color: const Color(0xFFE5E7EB)),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.info_outline, size: 18, color: Colors.black54),
                                  const SizedBox(width: 6),
                                  Text("Model: ${aiAnalysis['model']}", style: const TextStyle(fontSize: 12, color: Colors.black54)),
                                  const SizedBox(width: 6),
                                  const Text("•", style: TextStyle(fontSize: 12, color: Colors.black54)),
                                  const SizedBox(width: 6),
                                  Text("Rủi ro: ${aiAnalysis['hallucinationRisk']}", style: const TextStyle(fontSize: 12, color: Colors.black54)),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text((analysis['summary'] ?? '').toString()),
                              if ((aiAnalysis['biasNotes'] ?? '').toString().isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFFFBEB),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text("Lưu ý thiên vị: ${aiAnalysis['biasNotes']}", style: const TextStyle(fontSize: 12, color: Color(0xFF92400E))),
                                )
                              ],
                            ],
                          ),
                        ),

                        // SR-only (accessibility) -> Flutter không có SR-only mặc định, nên bỏ qua.
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------- Small UI pieces ----------

class _Badge extends StatelessWidget {
  final Widget child;
  final Color bg;
  final Color fg;
  const _Badge({required this.child, this.bg = const Color(0xFF111827), this.fg = Colors.white, Key? key})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: bg.withOpacity(0.6)),
      ),
      child: DefaultTextStyle(style: TextStyle(color: fg, fontSize: 12), child: child),
    );
  }
}

class _AlertBox extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final Color bg;
  final Color border;
  final Color iconColor;
  const _AlertBox({
    Key? key,
    required this.icon,
    required this.title,
    required this.description,
    this.bg = const Color(0xFFF9FAFB),
    this.border = const Color(0xFFE5E7EB),
    this.iconColor = Colors.black54,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration:
          BoxDecoration(color: bg, border: Border.all(color: border), borderRadius: BorderRadius.circular(10)),
      padding: const EdgeInsets.all(12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: iconColor),
          const SizedBox(width: 8),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(description, style: const TextStyle(color: Colors.black87)),
            ]),
          ),
        ],
      ),
    );
  }
}

class _ProsConsSection extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color iconColor;
  final List<String> items;
  const _ProsConsSection({
    Key? key,
    required this.title,
    required this.icon,
    required this.iconColor,
    required this.items,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final showing = items.take(5).where((e) => e.trim().isNotEmpty).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          Icon(icon, size: 18, color: iconColor),
          const SizedBox(width: 6),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        ]),
        const SizedBox(height: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: showing
              .map((t) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("• "),
                        Expanded(child: Text(t, style: const TextStyle(color: Colors.black87))),
                      ],
                    ),
                  ))
              .toList(),
        ),
      ],
    );
  }
}

class _AccordionTile extends StatefulWidget {
  final String title;
  final String? subtitle;
  final String? trailingChip;
  final Widget child;
  const _AccordionTile({Key? key, required this.title, required this.child, this.subtitle, this.trailingChip})
      : super(key: key);

  @override
  State<_AccordionTile> createState() => _AccordionTileState();
}

class _AccordionTileState extends State<_AccordionTile> {
  bool open = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFE5E7EB)),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 10),
          childrenPadding: const EdgeInsets.fromLTRB(10, 0, 10, 10),
          onExpansionChanged: (v) => setState(() => open = v),
          trailing: Row(mainAxisSize: MainAxisSize.min, children: [
            if (widget.trailingChip != null)
              const _Badge(bg: Color(0xFFD1FAE5), fg: Color(0xFF047857), child: Text("Tác động chính", style: TextStyle(fontSize: 10))),
            const SizedBox(width: 6),
            Icon(open ? Icons.expand_less : Icons.expand_more),
          ]),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(widget.title, style: const TextStyle(fontWeight: FontWeight.w600)),
              if ((widget.subtitle ?? '').isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(widget.subtitle!, style: const TextStyle(fontSize: 12, color: Colors.black54)),
                ),
            ],
          ),
          children: [widget.child],
        ),
      ),
    );
  }
}

// ScoreRing: giả lập conic-gradient bằng SweepGradient + lỗ tròn ở giữa
class _ScoreRing extends StatelessWidget {
  final double size;
  final double score; // 0..100
  final double thickness;
  final Color fg;
  const _ScoreRing({
    Key? key,
    required this.score,
    this.size = 80,
    this.thickness = 10,
    required this.fg,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final bg = const Color(0xFFE5E7EB);
    final stop = (score.clamp(0, 100)) / 100.0;
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Outer sweep gradient circle
          Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: SweepGradient(
                colors: [fg, fg, bg, bg],
                stops: [stop, stop, stop, 1.0],
              ),
            ),
          ),
          // Inner hole
          Container(
            width: size - thickness * 2,
            height: size - thickness * 2,
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
          ),
          // Text
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(score.toStringAsFixed(0), style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 2),
              const Text("/100", style: TextStyle(fontSize: 10, color: Colors.black54)),
            ],
          ),
        ],
      ),
    );
  }
}
