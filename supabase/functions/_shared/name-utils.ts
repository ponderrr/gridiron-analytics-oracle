export interface NameVariation {
  normalized: string;
  lastNameFirst: string;
  firstInitialLast: string;
  variations: string[];
}

export class NameNormalizer {
  private static readonly SUFFIXES = ["jr", "sr", "ii", "iii", "iv", "v"];
  private static readonly NICKNAME_MAP = new Map([
    ["patrick", "pat"],
    ["pat", "patrick"],
    ["william", "will"],
    ["will", "william"],
    ["robert", "rob"],
    ["rob", "robert"],
    ["anthony", "tony"],
    ["tony", "anthony"],
    ["christopher", "chris"],
    ["chris", "christopher"],
    ["michael", "mike"],
    ["mike", "michael"],
    ["alexander", "alex"],
    ["alex", "alexander"],
    ["andrew", "andy"],
    ["andy", "andrew"],
    ["daniel", "dan"],
    ["dan", "daniel"],
    ["joseph", "joe"],
    ["joe", "joseph"],
    ["david", "dave"],
    ["dave", "david"],
    ["matthew", "matt"],
    ["matt", "matthew"],
    ["nicholas", "nick"],
    ["nick", "nicholas"],
    ["benjamin", "ben"],
    ["ben", "benjamin"],
    ["jonathan", "jon"],
    ["jon", "jonathan"],
    ["nathaniel", "nate"],
    ["nate", "nathaniel"],
  ]);

  static normalizeName(name: string): string {
    if (!name) return "";

    return name
      .toLowerCase()
      .replace(/[.,'`]/g, "") // Remove punctuation except hyphens
      .replace(/\s+/g, " ") // Normalize spaces
      .replace(new RegExp(`\\b(${this.SUFFIXES.join("|")})\\b`, "g"), "") // Remove suffixes
      .trim();
  }

  static createNameVariations(fullName: string): NameVariation {
    const normalized = this.normalizeName(fullName);
    const parts = normalized.split(" ").filter((p) => p.length > 0);

    if (parts.length < 2) {
      return {
        normalized,
        lastNameFirst: normalized,
        firstInitialLast: normalized,
        variations: [normalized],
      };
    }

    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    const middleParts = parts.slice(1, -1);

    const variations = new Set([normalized]);

    // Last name first format
    const lastNameFirst =
      `${lastName} ${firstName}${middleParts.length ? " " + middleParts.join(" ") : ""}`.trim();
    variations.add(lastNameFirst);

    // First initial + last name
    const firstInitialLast = `${firstName.charAt(0)} ${lastName}`;
    variations.add(firstInitialLast);

    // Add nickname variations
    const nickname = this.NICKNAME_MAP.get(firstName);
    if (nickname) {
      const nicknameVariation =
        `${nickname}${middleParts.length ? " " + middleParts.join(" ") : ""} ${lastName}`.trim();
      variations.add(nicknameVariation);
    }

    // Handle initials in original name (D.J. Moore, D. J. Moore, DJ Moore)
    if (/\./.test(firstName) || /^[A-Z](?:[.\s]*[A-Z])+$/i.test(firstName)) {
      // Remove all dots and spaces to get the compact form (e.g., 'DJ')
      const compactInitials = firstName.replace(/[.\s]/g, "");
      const compactVariation =
        `${compactInitials}${middleParts.length ? " " + middleParts.join(" ") : ""} ${lastName}`.trim();
      variations.add(compactVariation);

      // Add spaced initials (e.g., 'D J')
      const spacedInitials = compactInitials.split("").join(" ");
      const spacedVariation =
        `${spacedInitials}${middleParts.length ? " " + middleParts.join(" ") : ""} ${lastName}`.trim();
      variations.add(spacedVariation);

      // Add dot-separated initials (e.g., 'D.J.')
      const dotInitials = compactInitials.split("").join(".") + ".";
      const dotVariation =
        `${dotInitials}${middleParts.length ? " " + middleParts.join(" ") : ""} ${lastName}`.trim();
      variations.add(dotVariation);

      // Add dot-space-separated initials (e.g., 'D. J.')
      const dotSpaceInitials = compactInitials.split("").join(". ") + ".";
      const dotSpaceVariation =
        `${dotSpaceInitials}${middleParts.length ? " " + middleParts.join(" ") : ""} ${lastName}`.trim();
      variations.add(dotSpaceVariation);
    }

    return {
      normalized,
      lastNameFirst,
      firstInitialLast,
      variations: Array.from(variations),
    };
  }

  static extractLastName(fullName: string): string {
    const normalized = this.normalizeName(fullName);
    const parts = normalized.split(" ").filter((p) => p.length > 0);
    return parts.length > 0 ? parts[parts.length - 1] : "";
  }

  static extractFirstName(fullName: string): string {
    const normalized = this.normalizeName(fullName);
    const parts = normalized.split(" ").filter((p) => p.length > 0);
    return parts.length > 0 ? parts[0] : "";
  }
}
