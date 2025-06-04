import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text as PaperText, useTheme } from 'react-native-paper';
// import { DimensionHelper } from "@/src/helpers/DimensionHelper"; // Try to remove direct usage

interface Props {
  title: string;
  rightHeaderComponent?: (props: { size: number }) => React.ReactNode; // Matched to Card.Title right prop
  headerIcon?: (props: { size: number }) => React.ReactNode; // Matched to Card.Title left prop
  children: React.ReactNode;
  style?: object; // Allow passing additional styles to the Card
  // Add elevation prop if you want to control it dynamically, otherwise Card default or fixed
  elevation?: number;
}

export function DisplayBox({
  title,
  rightHeaderComponent,
  headerIcon,
  children,
  style,
  elevation,
}: Props) {
  const theme = useTheme();

  // Define styles using theme
  // No need for DimensionHelper for padding, margins, borderRadius if using theme standards
  const styles = StyleSheet.create({
    card: {
      // width: DimensionHelper.wp(100), // Card typically takes full width of parent or content size.
      // If 100% width of screen is needed, parent container should manage this.
      // Consider using marginHorizontal from theme for spacing from screen edges.
      marginHorizontal: theme.spacing.medium, // Example: for spacing from screen edges
      marginTop: theme.spacing.medium,       // Example: for spacing from elements above
      // backgroundColor: theme.colors.surface, // Card default
      // borderRadius: theme.roundness,      // Card default
    },
    cardTitle: {
      // Styles for Card.Title itself, if needed (e.g., border)
      // The previous 'paymentTitleHeaderLine' might be a borderBottom on Card.Title
      // borderBottomWidth: 1,
      // borderBottomColor: theme.colors.outline,
    },
    cardTitleText: {
      // fontWeight: 'bold', // PaperText variants or theme fonts handle this
      // fontSize: DimensionHelper.wp(4), // Use PaperText variants
    },
    cardContent: {
      // padding: DimensionHelper.wp(3) // Card.Content has default padding, can be styled
      // paddingTop: theme.spacing.medium, // Example
    }
  });

  // Default icon/component size for Card.Title left/right props
  const iconSize = 24;

  return (
    <Card style={[styles.card, style]} elevation={elevation === undefined ? 5 : elevation}>
      {(title || headerIcon || rightHeaderComponent) && (
        <Card.Title
          title={title}
          titleVariant="headlineSmall" // Example of using a variant for styling
          // titleStyle={styles.cardTitleText} // Or use direct style if variant is not enough
          left={headerIcon ? (props) => headerIcon({ ...props, size: iconSize }) : undefined}
          right={rightHeaderComponent ? (props) => rightHeaderComponent({ ...props, size: iconSize }) : undefined}
          style={styles.cardTitle}
        />
      )}
      <Card.Content style={styles.cardContent}>
        {children}
      </Card.Content>
    </Card>
  );
}
