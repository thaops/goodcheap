// import 'package:flutter/material.dart';
// import 'package:goodcheap_app/common/design_system/tokens/app_colors.dart';
// import 'package:goodcheap_app/features/presentation/flight_list/view/flight_list.dart';
// import 'package:goodcheap_app/features/presentation/home/view/home_view.dart';
// import 'package:goodcheap_app/features/presentation/more/view/more_view.dart';
// import 'package:goodcheap_app/features/presentation/notification/view/notification_view.dart';
// import 'package:goodcheap_app/features/presentation/schedule/view/schedule_view.dart';
// import 'package:go_router/go_router.dart';

// class MainScreen extends StatefulWidget {
//   final StatefulNavigationShell navigationShell;
//   const MainScreen({Key? key, required this.navigationShell}) : super(key: key);

//   @override
//   State<MainScreen> createState() => _MainScreenState();
// }

// class _MainScreenState extends State<MainScreen> {
//   int _currentIndex = 0;
//   late PageController _pageController;

//   @override
//   void initState() {
//     super.initState();
//     _currentIndex = widget.navigationShell.currentIndex;
//     _pageController = PageController(initialPage: _currentIndex);
//   }

//   @override
//   void dispose() {
//     _pageController.dispose();
//     super.dispose();
//   }

//   // Lazily build each screen only when needed
//   Widget _buildScreen(int index) {
//     switch (index) {
//       case 0:
//         return HomeView();
//       case 1:
//         return const FlightListScreen(isMyFlight: false);
//       case 2:
//         return const ScheduleView();
//       case 3:
//         return const NotificationView();
//       case 4:
//       default:
//         return const MoreView();
//     }
//   }

//   void _onItemTapped(int index) {
//     setState(() {
//       _currentIndex = index;
//     });
//     // Switch tab using go_router's navigation shell
//     widget.navigationShell.goBranch(
//       index,
//       initialLocation: index == widget.navigationShell.currentIndex,
//     );
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: widget.navigationShell,
//       bottomNavigationBar: Container(
//         decoration: BoxDecoration(
//           borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
//         ),
//         child: NavigationBar(
//           selectedIndex: _currentIndex,
//           onDestinationSelected: _onItemTapped,
//           height: 70,
//           backgroundColor: AppColors.white,
//           indicatorColor: AppColors.primary.withValues(alpha: 0.2),
//           labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
//           animationDuration: const Duration(milliseconds: 300),
//           destinations: _buildDestinations(),
//         ),
//       ),
//     );
//   }

//   List<NavigationDestination> _buildDestinations() {
//     return [
//       NavigationDestination(
//         icon: Icon(Icons.home_outlined, size: 26, color: Colors.grey[600]),
//         selectedIcon: Icon(Icons.home_rounded, size: 26, color: AppColors.primary),
//         label: 'Home',
//       ),
//       NavigationDestination(
//         icon: Icon(Icons.flight_takeoff_outlined, size: 26, color: Colors.grey[600]),
//         selectedIcon: Icon(Icons.flight_takeoff_rounded, size: 26, color: AppColors.primary),
//         label: 'Flight',
//       ),
//       NavigationDestination(
//         icon: Icon(Icons.calendar_month_outlined, size: 26, color: Colors.grey[600]),
//         selectedIcon: Icon(Icons.calendar_month_rounded, size: 26, color: AppColors.primary),
//         label: 'Schedule',
//       ),
//       NavigationDestination(
//         icon: Icon(Icons.notifications_outlined, size: 26, color: Colors.grey[600]),
//         selectedIcon: Icon(Icons.notifications_rounded, size: 26, color: AppColors.primary),
//         label: 'Notice',
//       ),
//       NavigationDestination(
//         icon: Icon(Icons.more_horiz_outlined, size: 26, color: Colors.grey[600]),
//         selectedIcon: Icon(Icons.more_horiz_rounded, size: 26, color: AppColors.primary),
//         label: 'More',
//       ),
//     ];
//   }
// }