import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput,
  View, Text, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Footprints, Gem, ShoppingBag, Archive, Shirt } from 'lucide-react-native';
import { Crimson, Fonts } from '@/constants/Colors';
import { useAppStore } from '../../store';
import { ClosetSection, SectionKind, WardrobeItem } from '../../types';

// ============================================================================
// Wardrobe — "My Kloset" (Crimson redesign, Phone A).
// Shelves are horizontal rails with hanger hooks; drawers are glass trays for
// folded / non-hanging things. Data: store.sections + wardrobeItems grouped
// by sectionId.
// ============================================================================

// why lucide icons instead of emoji: emoji glyphs render inconsistently
// (tofu boxes) across Android OEM fonts; vector icons match the design's
// stroke style and never break. Inferred from the user's own naming so
// custom drawers still get one.
const DrawerIcon = ({ name }: { name: string }) => {
  const n = name.toLowerCase();
  const props = { size: 15, color: 'rgba(255,255,255,0.85)', strokeWidth: 2 };
  if (/(shoe|foot|jutti|heel|sneaker)/.test(n)) return <Footprints {...props} />;
  if (/(access|jewel|ring|earring|watch)/.test(n)) return <Gem {...props} />;
  if (/(bag|clutch|tote|purse)/.test(n)) return <ShoppingBag {...props} />;
  return <Archive {...props} />;
};

const itemThumb = (item: WardrobeItem) => item.cutoutUrl || item.imageUrl;

export default function WardrobeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const wardrobeItems = useAppStore((s) => s.wardrobeItems);
  const sections = useAppStore((s) => s.sections);
  const fetchSections = useAppStore((s) => s.fetchSections);
  const createSection = useAppStore((s) => s.createSection);
  const renameSection = useAppStore((s) => s.renameSection);
  const deleteSection = useAppStore((s) => s.deleteSection);
  const moveItemToSection = useAppStore((s) => s.moveItemToSection);
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  useEffect(() => {
    // per the hydration rule: wait for the restored JWT before calling the API
    if (!hasHydrated || !isAuthenticated) return;
    fetchSections();
  }, [hasHydrated, isAuthenticated]);

  // Modals
  const [renameTarget, setRenameTarget] = useState<ClosetSection | null>(null);
  const [renameText, setRenameText] = useState('');
  const [newKind, setNewKind] = useState<SectionKind | null>(null);
  const [newName, setNewName] = useState('');
  const [moveItem, setMoveItem] = useState<WardrobeItem | null>(null);

  const shelves = useMemo(() => sections.filter((s) => s.kind === 'shelf'), [sections]);
  const drawers = useMemo(() => sections.filter((s) => s.kind === 'drawer'), [sections]);
  const bySection = useMemo(() => {
    const map: Record<string, WardrobeItem[]> = {};
    for (const item of wardrobeItems) {
      const key = item.sectionId || 'unsorted';
      (map[key] = map[key] || []).push(item);
    }
    return map;
  }, [wardrobeItems]);
  const unsorted = bySection['unsorted'] || [];

  const submitRename = async () => {
    if (!renameTarget || !renameText.trim()) return;
    try {
      await renameSection(renameTarget.id, renameText.trim());
    } catch (e: any) {
      Alert.alert('Rename failed', e.message);
    }
    setRenameTarget(null);
  };

  const submitDelete = () => {
    if (!renameTarget) return;
    const target = renameTarget;
    Alert.alert(
      `Delete "${target.name}"?`,
      'Its garments move to another ' + target.kind + ' — nothing is lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            setRenameTarget(null);
            try { await deleteSection(target.id); } catch (e: any) { Alert.alert('Delete failed', e.message); }
          },
        },
      ]
    );
  };

  const submitCreate = async () => {
    if (!newKind || !newName.trim()) return;
    try {
      await createSection(newName.trim(), newKind);
    } catch (e: any) {
      Alert.alert('Create failed', e.message);
    }
    setNewKind(null);
    setNewName('');
  };

  const ShelfRail = ({ section, items, first }: { section: ClosetSection | null; items: WardrobeItem[]; first?: boolean }) => (
    // why first: design puts 6px above the first shelf, 24px above the rest
    <View style={[styles.shelfBlock, first && styles.shelfBlockFirst]}>
      <View style={styles.shelfHeader}>
        <View style={styles.shelfHeaderLeft}>
          <View style={styles.gripLines}>
            <View style={styles.gripLine} />
            <View style={styles.gripLine} />
          </View>
          <Text style={styles.shelfName}>{section ? section.name : 'Unsorted'}</Text>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{items.length}</Text>
          </View>
        </View>
        {section && (
          <TouchableOpacity onPress={() => { setRenameTarget(section); setRenameText(section.name); }}>
            <Text style={styles.renameLink}>Rename</Text>
          </TouchableOpacity>
        )}
      </View>
      <View>
        {/* the dashed hanging rail behind the hooks */}
        <View style={styles.rail} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railScroll}>
          {items.length === 0 ? (
            <Text style={styles.emptyRailText}>Nothing hung here yet</Text>
          ) : (
            items.map((item) => (
              <TouchableOpacity key={item.id} style={styles.hangCard} onLongPress={() => setMoveItem(item)} activeOpacity={0.85}>
                <View style={styles.hangerHook} />
                <View style={styles.hangImageWrap}>
                  <Image source={{ uri: itemThumb(item) }} style={styles.hangImage} />
                </View>
                <Text style={styles.hangName} numberOfLines={2}>
                  {(item.colors?.[0] ? item.colors[0] + ' ' : '') + (item.subType || item.category)}
                </Text>
                <Text style={styles.hangMeta} numberOfLines={1}>{item.fabric}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      {/* bottom glow */}
      <LinearGradient colors={[...Crimson.glow]} style={styles.glow} locations={[0, 0.6, 1]} />

      {/* header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View>
          <Text style={styles.title}>My Kloset</Text>
          <Text style={styles.subTitle}>
            {wardrobeItems.length} pieces · {shelves.length} {shelves.length === 1 ? 'shelf' : 'shelves'} · {drawers.length} {drawers.length === 1 ? 'drawer' : 'drawers'}
          </Text>
        </View>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setNewKind('shelf')}>
          <View style={styles.menuLine} /><View style={styles.menuLine} /><View style={styles.menuLine} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {shelves.map((s, i) => (
          <ShelfRail key={s.id} section={s} items={bySection[s.id] || []} first={i === 0} />
        ))}
        {unsorted.length > 0 && <ShelfRail section={null} items={unsorted} first={shelves.length === 0} />}

        <TouchableOpacity style={styles.newBtn} onPress={() => setNewKind('shelf')}>
          <Text style={styles.newBtnText}>＋ New shelf</Text>
        </TouchableOpacity>

        {/* drawers */}
        <View style={styles.drawersHeader}>
          <Text style={styles.drawersLabel}>DRAWERS</Text>
          <View style={styles.drawersRule} />
        </View>

        {drawers.map((d) => {
          const items = bySection[d.id] || [];
          return (
            <View key={d.id} style={styles.drawerCard}>
              <View style={styles.drawerHandle} />
              <View style={styles.drawerHeader}>
                <View style={styles.drawerHeaderLeft}>
                  <DrawerIcon name={d.name} />
                  <Text style={styles.drawerName}>{d.name}</Text>
                  <View style={styles.countPill}>
                    <Text style={styles.countPillText}>{items.length}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => { setRenameTarget(d); setRenameText(d.name); }}>
                  <Text style={styles.manageLink}>Manage</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {items.length === 0 ? (
                  <Text style={styles.emptyRailText}>Empty drawer</Text>
                ) : (
                  items.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.drawerItem} onLongPress={() => setMoveItem(item)} activeOpacity={0.85}>
                      <Image source={{ uri: itemThumb(item) }} style={styles.drawerThumb} />
                      <Text style={styles.drawerItemLabel} numberOfLines={2}>{item.subType || item.category}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          );
        })}

        <TouchableOpacity style={[styles.newBtn, { marginTop: 14 }]} onPress={() => setNewKind('drawer')}>
          <Text style={styles.newBtnText}>＋ New drawer</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* bottom CTA */}
      <LinearGradient colors={['transparent', Crimson.darkBg]} locations={[0, 0.4]} style={styles.ctaWrap} pointerEvents="box-none">
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/upload')}>
          <LinearGradient colors={[...Crimson.cta]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.3 }} style={styles.cta}>
            <Text style={styles.ctaText}>Add Garment ＋</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* rename / manage modal */}
      <Modal visible={!!renameTarget} transparent animationType="fade" onRequestClose={() => setRenameTarget(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{renameTarget?.kind === 'drawer' ? 'Manage drawer' : 'Rename shelf'}</Text>
            <TextInput
              value={renameText}
              onChangeText={setRenameText}
              style={styles.modalInput}
              placeholder="Name"
              placeholderTextColor={Crimson.white45}
              autoFocus
            />
            <TouchableOpacity onPress={submitRename}>
              <LinearGradient colors={[...Crimson.cta]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.3 }} style={styles.modalPrimary}>
                <Text style={styles.ctaText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalDanger} onPress={submitDelete}>
              <Text style={styles.modalDangerText}>Delete {renameTarget?.kind}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setRenameTarget(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* new section modal */}
      <Modal visible={!!newKind} transparent animationType="fade" onRequestClose={() => setNewKind(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New section</Text>
            <View style={styles.kindRow}>
              {(['shelf', 'drawer'] as SectionKind[]).map((k) => (
                <TouchableOpacity
                  key={k}
                  onPress={() => setNewKind(k)}
                  style={[styles.kindChip, newKind === k && styles.kindChipActive]}
                >
                  <Text style={[styles.kindChipText, newKind === k && styles.kindChipTextActive]}>
                    {k === 'shelf' ? 'Shelf' : 'Drawer'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              style={styles.modalInput}
              placeholder={newKind === 'drawer' ? 'e.g. Footwear' : 'e.g. Festive'}
              placeholderTextColor={Crimson.white45}
              autoFocus
            />
            <TouchableOpacity onPress={submitCreate}>
              <LinearGradient colors={[...Crimson.cta]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.3 }} style={styles.modalPrimary}>
                <Text style={styles.ctaText}>Create</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => { setNewKind(null); setNewName(''); }}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* move item modal */}
      <Modal visible={!!moveItem} transparent animationType="fade" onRequestClose={() => setMoveItem(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Move "{moveItem ? (moveItem.subType || moveItem.category) : ''}" to…</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {sections.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.moveRow, moveItem?.sectionId === s.id && styles.moveRowActive]}
                  onPress={async () => {
                    const item = moveItem!;
                    setMoveItem(null);
                    try { await moveItemToSection(item.id, s.id); await fetchSections(); }
                    catch (e: any) { Alert.alert('Move failed', e.message); }
                  }}
                >
                  {s.kind === 'drawer' ? <DrawerIcon name={s.name} /> : <Shirt size={15} color='rgba(255,255,255,0.85)' strokeWidth={2} />}
                  <Text style={styles.moveRowText}>{s.name}</Text>
                  <Text style={styles.moveRowKind}>{s.kind}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setMoveItem(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Crimson.darkBg },
  glow: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '66%' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 22, paddingBottom: 8,
  },
  title: { color: '#fff', fontFamily: Fonts.display, fontSize: 30, letterSpacing: -0.5, lineHeight: 29 },
  subTitle: { color: Crimson.white55, fontFamily: Fonts.bodyMed, fontSize: 11, marginTop: 6 },
  menuBtn: {
    width: 42, height: 42, borderRadius: 13, backgroundColor: Crimson.glassBg,
    alignItems: 'center', justifyContent: 'center', gap: 3,
  },
  menuLine: { width: 15, height: 2, backgroundColor: '#fff', borderRadius: 2 },
  scroll: { paddingBottom: 170, paddingTop: 0 },

  // shelves — design: 24px above each shelf, 6px above the very first
  shelfBlock: { marginTop: 24 },
  shelfBlockFirst: { marginTop: 6 },
  shelfHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 22, marginBottom: 11,
  },
  shelfHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  gripLines: { gap: 2.5 },
  gripLine: { width: 11, height: 2, backgroundColor: Crimson.white35, borderRadius: 2 },
  shelfName: { color: '#fff', fontFamily: Fonts.display, fontSize: 16 },
  countPill: {
    backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
  },
  countPillText: { color: Crimson.white80, fontFamily: Fonts.body, fontSize: 10 },
  renameLink: { color: 'rgba(255,255,255,0.5)', fontFamily: Fonts.body, fontSize: 12 },
  rail: {
    position: 'absolute', top: 9, left: 0, right: 0, height: 0,
    borderTopWidth: 2, borderColor: 'rgba(255,255,255,0.22)', borderStyle: 'dashed',
  },
  railScroll: { paddingHorizontal: 22, paddingBottom: 6, gap: 12 },
  emptyRailText: { color: Crimson.white35, fontFamily: Fonts.bodyMed, fontSize: 11, paddingTop: 40 },
  hangCard: { width: 104 },
  hangerHook: {
    width: 12, height: 15, alignSelf: 'center', marginBottom: -1,
    borderWidth: 2, borderBottomWidth: 0, borderColor: 'rgba(255,255,255,0.4)',
    borderTopLeftRadius: 9, borderTopRightRadius: 9,
  },
  hangImageWrap: {
    // design: 16/16/14/14 corners
    height: 126, borderTopLeftRadius: 16, borderTopRightRadius: 16,
    borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
    overflow: 'hidden', backgroundColor: '#2a1218',
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  hangImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  hangName: { color: '#fff', fontFamily: Fonts.body, fontSize: 11, lineHeight: 13, marginTop: 7, minHeight: 26, textTransform: 'capitalize' },
  hangMeta: { color: Crimson.white45, fontFamily: Fonts.bodyMed, fontSize: 9.5 },

  newBtn: {
    marginHorizontal: 22, marginTop: 22, borderWidth: 1.5, borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.28)', borderRadius: 14, paddingVertical: 12, alignItems: 'center',
  },
  newBtnText: { color: Crimson.white70, fontFamily: Fonts.bodyBold, fontSize: 12.5 },

  // drawers
  drawersHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 4 },
  drawersLabel: { color: 'rgba(255,255,255,0.85)', fontFamily: Fonts.display, fontSize: 12, letterSpacing: 1.4 },
  drawersRule: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  drawerCard: {
    marginHorizontal: 22, marginTop: 12, backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 18, padding: 12, paddingBottom: 14,
  },
  drawerHandle: { width: 34, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.22)', alignSelf: 'center', marginBottom: 10 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 },
  drawerHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  drawerGlyph: { fontSize: 14 },
  drawerName: { color: '#fff', fontFamily: Fonts.bodyBold, fontSize: 13 },
  manageLink: { color: Crimson.white45, fontFamily: Fonts.body, fontSize: 11 },
  drawerItem: { alignItems: 'center', width: 78 },
  drawerThumb: { width: 78, height: 78, borderRadius: 14, backgroundColor: '#2a1218' },
  drawerItemLabel: { color: Crimson.white70, fontFamily: Fonts.bodyMed, fontSize: 9, marginTop: 5 },

  // CTA
  ctaWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 12 },
  cta: {
    borderRadius: 16, paddingVertical: 15, alignItems: 'center',
    shadowColor: Crimson.crimsonBright, shadowOpacity: 0.55, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 10,
  },
  ctaText: { color: '#fff', fontFamily: Fonts.bodyBold, fontSize: 14 },

  // modals
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 28 },
  modalCard: {
    backgroundColor: '#1d0d11', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', padding: 20,
  },
  modalTitle: { color: '#fff', fontFamily: Fonts.display, fontSize: 17, marginBottom: 14 },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 13, color: '#fff', fontFamily: Fonts.body, fontSize: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14,
  },
  modalPrimary: { borderRadius: 13, paddingVertical: 13, alignItems: 'center' },
  modalDanger: { alignItems: 'center', paddingVertical: 12, marginTop: 6 },
  modalDangerText: { color: Crimson.rose, fontFamily: Fonts.body, fontSize: 13 },
  modalCancel: { alignItems: 'center', paddingVertical: 10 },
  modalCancelText: { color: Crimson.white55, fontFamily: Fonts.body, fontSize: 13 },
  kindRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  kindChip: {
    flex: 1, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12,
    paddingVertical: 10, alignItems: 'center',
  },
  kindChipActive: { backgroundColor: Crimson.crimson, borderColor: Crimson.crimson },
  kindChipText: { color: Crimson.white70, fontFamily: Fonts.body, fontSize: 13 },
  kindChipTextActive: { color: '#fff' },
  moveRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 10, borderRadius: 12,
  },
  moveRowActive: { backgroundColor: 'rgba(249,49,79,0.14)' },
  moveRowGlyph: { fontSize: 14 },
  moveRowText: { color: '#fff', fontFamily: Fonts.body, fontSize: 14, flex: 1 },
  moveRowKind: { color: Crimson.white45, fontFamily: Fonts.bodyMed, fontSize: 11 },
});
