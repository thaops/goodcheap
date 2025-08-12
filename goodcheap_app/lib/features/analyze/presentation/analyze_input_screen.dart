import 'package:flutter/material.dart';
import 'package:goodcheap_app/main.dart' show ProductAnalysisPage; // reuse existing screen

class AnalyzeInputScreen extends StatefulWidget {
  const AnalyzeInputScreen({super.key});

  @override
  State<AnalyzeInputScreen> createState() => _AnalyzeInputScreenState();
}

class _AnalyzeInputScreenState extends State<AnalyzeInputScreen> {
  final _controller = TextEditingController(text: 'https://vt.tiktok.com/ZSSsfXn2c/');
  String? _error;

  Future<void> _submit() async {
    final url = _controller.text.trim();
    if (url.isEmpty) {
      setState(() => _error = 'Vui lòng nhập URL');
      return;
    }

    setState(() => _error = null);
    if (!mounted) return;
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ProductAnalysisPage(url: url),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Analyze Product URL')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Nhập link sản phẩm (TikTok, v.v.)'),
            const SizedBox(height: 8),
            TextField(
              controller: _controller,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: 'https://...'
              ),
              onSubmitted: (_) => _submit(),
            ),
            const SizedBox(height: 12),
            if (_error != null)
              Text(_error!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _submit,
                icon: const Icon(Icons.search),
                label: const Text('Analyze'),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Lưu ý: Nếu chạy trên Android emulator, localhost có thể là 10.0.2.2:3000. ' 
              'Trên Windows/Desktop có thể dùng localhost trực tiếp.',
              style: TextStyle(fontSize: 12, color: Colors.black54),
            ),
          ],
        ),
      ),
    );
  }
}
