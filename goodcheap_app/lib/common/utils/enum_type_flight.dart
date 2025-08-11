enum SupplyFormType {
  meal,
  drink,
  equipment,
  towel,
  cart,
}



extension SupplyFormTypeExtension on SupplyFormType {
  String get label {
    switch (this) {
      case SupplyFormType.meal:
        return 'Meal';
      case SupplyFormType.drink:
        return 'Drink';
      case SupplyFormType.equipment:
        return 'Equipment';
      case SupplyFormType.towel:
        return 'Towel';
      case SupplyFormType.cart:
        return 'Cart';
    }
  }

  bool get isEditable =>
      this == SupplyFormType.drink ||
      this == SupplyFormType.equipment ||
      this == SupplyFormType.cart;

  static SupplyFormType? fromString(String value) {
    return SupplyFormType.values.firstWhere(
      (e) => e.name.toLowerCase() == value.toLowerCase(),
      orElse: () => SupplyFormType.meal, // hoặc null nếu muốn chặt chẽ hơn
    );
  }
}



bool containsAnySupplyFormType(String title) {
  final lowerTitle = title.toLowerCase();
  return SupplyFormType.values.any((type) => lowerTitle.contains(type.label));
}


