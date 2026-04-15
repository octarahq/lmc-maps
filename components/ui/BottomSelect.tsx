import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Item<T = string> = {
  key: string;
  label: string;
  value: T;
};

type Mode = "single" | "multiple";

export type BottomSelectHandle = {
  open: () => void;
  close: () => void;
};

type Props<T = string> = {
  title?: string;
  items: Item<T>[];
  mode?: Mode;
  initialSelected?: T[] | T | null;
  onChange?: (selected: T[] | T | null) => void;
  backgroundColor?: string;
};

function BottomSelectInner<T = string>(
  {
    title,
    items,
    mode = "single",
    initialSelected = null,
    onChange,
    backgroundColor = "rgba(16,25,34,0.96)",
  }: Props<T>,
  ref: React.ForwardedRef<BottomSelectHandle>,
) {
  const sheetRef = React.useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => [240], []);

  const normalizeInitial = React.useMemo(() => {
    if (mode === "multiple") {
      return Array.isArray(initialSelected)
        ? (initialSelected as T[])
        : initialSelected === null
          ? ([] as T[])
          : ([initialSelected as T] as T[]);
    }
    return Array.isArray(initialSelected)
      ? (initialSelected[0] as T | null)
      : (initialSelected as T | null);
  }, [initialSelected, mode]);

  const [selected, setSelected] = React.useState<T[] | T | null>(
    normalizeInitial,
  );

  React.useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.expand(),
    close: () => sheetRef.current?.close(),
  }));

  React.useEffect(() => {
    setSelected(normalizeInitial);
  }, [normalizeInitial]);

  const toggleMultiple = (value: T) => {
    if (!Array.isArray(selected)) return;
    const exists = selected.includes(value);
    const next = exists
      ? selected.filter((v: T) => v !== value)
      : [...selected, value];
    setSelected(next);
    onChange?.(next);
  };

  const selectSingle = (value: T) => {
    const next = value === selected ? null : value;
    setSelected(next);
    onChange?.(next);
  };

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.7}
      />
    ),
    [],
  );

  const renderItem = ({ item }: { item: Item<T> }) => {
    const isSelected =
      mode === "multiple"
        ? Array.isArray(selected) && selected.includes(item.value)
        : selected === item.value;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          if (mode === "multiple") toggleMultiple(item.value);
          else selectSingle(item.value);
        }}
      >
        <View style={styles.labelWrap}>
          <Text style={styles.itemLabel}>{item.label}</Text>
        </View>

        <View style={styles.control}>
          {mode === "multiple" ? (
            <View style={[styles.checkbox, isSelected && styles.checkboxOn]} />
          ) : (
            <View style={[styles.radio, isSelected && styles.radioOn]} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor }}
      handleIndicatorStyle={{ backgroundColor: "rgba(255,255,255,0.3)" }}
    >
      <BottomSheetView style={styles.sheetContent}>
        {title ? <Text style={styles.title}>{title}</Text> : null}

        <FlatList
          data={items}
          keyExtractor={(i) => i.key}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </BottomSheetView>
    </BottomSheet>
  );
}

const BottomSelect = React.forwardRef(BottomSelectInner);
BottomSelect.displayName = "BottomSelect";

const styles = StyleSheet.create({
  sheetContent: { padding: 16 },
  title: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  itemLabel: { color: "rgba(255,255,255,0.9)", fontSize: 15 },
  labelWrap: { flex: 1 },
  control: { width: 36, alignItems: "center", justifyContent: "center" },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "transparent",
  },
  checkboxOn: { backgroundColor: "#1EA7FF", borderColor: "#1EA7FF" },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: {
    borderColor: "#1EA7FF",
  },
  sep: { height: 1, backgroundColor: "rgba(255,255,255,0.03)" },
});

export default BottomSelect;
