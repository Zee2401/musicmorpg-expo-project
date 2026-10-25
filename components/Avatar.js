// A pure-RN character portrait. No images and no SVG: every shape is a View,
// so it renders identically on web, iOS and Android and can never 404.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  EYE_COLORS,
  HAIR_COLORS,
  OUTFIT_TINTS,
  SKIN_TONES,
  pick,
} from '../data/appearance';
import { getClass } from '../data/classes';
import { getOutfit } from '../data/outfits';
import { getPet } from '../data/pets';
import { colors } from '../theme';

// Geometry is derived from `size` so the portrait stays proportional at any
// scale, from a 60px list thumbnail to a 190px hero card.
const geometry = (size) => {
  const head = size * 0.34;
  return {
    head,
    headTop: size * 0.185,
    headLeft: (size - head) / 2,
  };
};

const Hair = ({ style, color, size, head, headTop, headLeft }) => {
  const base = { position: 'absolute', backgroundColor: color };
  const capWidth = head * 1.06;
  const capLeft = (size - capWidth) / 2;

  switch (style) {
    case 'long':
      return (
        <>
          <View
            style={[
              base,
              {
                width: capWidth,
                height: head * 0.64,
                left: capLeft,
                top: headTop - head * 0.06,
                borderTopLeftRadius: head,
                borderTopRightRadius: head,
              },
            ]}
          />
          <View
            style={[
              base,
              {
                width: head * 0.2,
                height: head * 0.95,
                left: headLeft - head * 0.15,
                top: headTop + head * 0.34,
                borderRadius: head * 0.12,
              },
            ]}
          />
          <View
            style={[
              base,
              {
                width: head * 0.2,
                height: head * 0.95,
                left: headLeft + head * 0.95,
                top: headTop + head * 0.34,
                borderRadius: head * 0.12,
              },
            ]}
          />
        </>
      );
    case 'braid':
      return (
        <>
          <View
            style={[
              base,
              {
                width: capWidth,
                height: head * 0.6,
                left: capLeft,
                top: headTop - head * 0.05,
                borderTopLeftRadius: head,
                borderTopRightRadius: head,
              },
            ]}
          />
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                base,
                {
                  width: head * (0.2 - i * 0.02),
                  height: head * (0.21 - i * 0.015),
                  left: headLeft + head * 0.98,
                  top: headTop + head * (0.42 + i * 0.22),
                  borderRadius: 99,
                },
              ]}
            />
          ))}
        </>
      );
    case 'wild':
      return (
        <>
          <View
            style={[
              base,
              {
                width: head * 0.52,
                height: head * 0.44,
                left: headLeft - head * 0.26,
                top: headTop - head * 0.12,
                borderRadius: 99,
              },
            ]}
          />
          <View
            style={[
              base,
              {
                width: head * 0.6,
                height: head * 0.5,
                left: headLeft + head * 0.2,
                top: headTop - head * 0.2,
                borderRadius: 99,
              },
            ]}
          />
          <View
            style={[
              base,
              {
                width: head * 0.44,
                height: head * 0.4,
                left: headLeft + head * 0.66,
                top: headTop - head * 0.08,
                borderRadius: 99,
              },
            ]}
          />
        </>
      );
    case 'shaved':
      return (
        <View
          style={[
            base,
            {
              width: head * 0.96,
              height: head * 0.22,
              left: headLeft + head * 0.02,
              top: headTop + head * 0.02,
              borderTopLeftRadius: 99,
              borderTopRightRadius: 99,
              opacity: 0.5,
            },
          ]}
        />
      );
    case 'topknot':
      return (
        <>
          <View
            style={[
              base,
              {
                width: capWidth,
                height: head * 0.52,
                left: capLeft,
                top: headTop - head * 0.04,
                borderTopLeftRadius: head,
                borderTopRightRadius: head,
              },
            ]}
          />
          <View
            style={[
              base,
              {
                width: head * 0.36,
                height: head * 0.36,
                left: headLeft + head * 0.32,
                top: headTop - head * 0.32,
                borderRadius: 99,
              },
            ]}
          />
        </>
      );
    case 'short':
    default:
      return (
        <View
          style={[
            base,
            {
              width: capWidth,
              height: head * 0.54,
              left: capLeft,
              top: headTop - head * 0.05,
              borderTopLeftRadius: head,
              borderTopRightRadius: head,
            },
          ]}
        />
      );
  }
};

/**
 * @param character  persisted character object (classId, appearance, outfitId…)
 * @param size       outer diameter in px
 * @param showPet    render the active pet badge
 * @param showBadge  render the class icon badge
 * @param ringColor  override the ring colour (defaults to class colour)
 */
const Avatar = ({ character, size = 132, showPet = true, showBadge = true, ringColor }) => {
  if (!character) return null;

  const appearance = character.appearance || {};
  const classDef = getClass(character.classId);
  const outfit = getOutfit(character.outfitId);
  const skin = pick(SKIN_TONES, appearance.skinTone).hex;
  const hair = pick(HAIR_COLORS, appearance.hairColor).hex;
  const eyes = pick(EYE_COLORS, appearance.eyeColor).hex;
  const tint = outfit?.tint || pick(OUTFIT_TINTS, appearance.outfitTint).hex;
  const pet = character.activePet ? getPet(character.activePet) : null;
  const accent = ringColor || classDef.color;
  const { head, headTop, headLeft } = geometry(size);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Stage ring */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surfaceAlt,
          borderWidth: 2,
          borderColor: accent,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.86,
          height: size * 0.86,
          borderRadius: size,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: 0.7,
        }}
      />

      {/* Shoulders / outfit */}
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.08,
          width: size * 0.52,
          height: size * 0.35,
          backgroundColor: tint,
          borderTopLeftRadius: size * 0.2,
          borderTopRightRadius: size * 0.2,
          borderBottomLeftRadius: size * 0.06,
          borderBottomRightRadius: size * 0.06,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.14)',
        }}
      />
      {/* Collar shadow */}
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.08 + size * 0.28,
          width: size * 0.19,
          height: size * 0.07,
          backgroundColor: colors.bgDeep,
          borderTopLeftRadius: 99,
          borderTopRightRadius: 99,
          opacity: 0.5,
        }}
      />
      {/* Neck */}
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.08 + size * 0.3,
          width: size * 0.11,
          height: size * 0.07,
          backgroundColor: skin,
        }}
      />
      {/* Head */}
      <View
        style={{
          position: 'absolute',
          top: headTop,
          left: headLeft,
          width: head,
          height: head,
          borderRadius: head / 2,
          backgroundColor: skin,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.18)',
        }}
      />
      <Hair
        style={appearance.hairStyle}
        color={hair}
        size={size}
        head={head}
        headTop={headTop}
        headLeft={headLeft}
      />

      {/* Eyes */}
      <View
        style={{
          position: 'absolute',
          top: headTop + head * 0.36,
          width: head * 0.62,
          left: headLeft + head * 0.19,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{ width: head * 0.14, height: head * 0.14, borderRadius: 99, backgroundColor: eyes }}
        />
        <View
          style={{ width: head * 0.14, height: head * 0.14, borderRadius: 99, backgroundColor: eyes }}
        />
      </View>
      {/* Mouth */}
      <View
        style={{
          position: 'absolute',
          top: headTop + head * 0.7,
          left: headLeft + head * 0.39,
          width: head * 0.22,
          height: 2,
          borderRadius: 2,
          backgroundColor: 'rgba(0,0,0,0.34)',
        }}
      />

      {showBadge && (
        <View
          style={{
            position: 'absolute',
            right: size * 0.01,
            bottom: size * 0.03,
            width: size * 0.26,
            height: size * 0.26,
            borderRadius: 99,
            backgroundColor: colors.surface,
            borderWidth: 1.5,
            borderColor: accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: size * 0.13 }}>{classDef.icon}</Text>
        </View>
      )}

      {showPet && pet && (
        <View
          style={{
            position: 'absolute',
            left: size * 0.01,
            bottom: size * 0.03,
            width: size * 0.24,
            height: size * 0.24,
            borderRadius: 99,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: size * 0.12 }}>{pet.icon}</Text>
        </View>
      )}
    </View>
  );
};

export default Avatar;
