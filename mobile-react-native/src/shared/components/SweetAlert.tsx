// SweetAlert2-style themed alert for React Native (Olímpio theme).
// Exposes an `Alert` object with the same signature as react-native's Alert
// so existing `Alert.alert(title, message?, buttons?, options?)` calls keep working.
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Alert as NativeAlert,
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {BorderRadius, Colors, Shadows, Typography} from '../styles/theme';

export type AlertButtonStyle = 'default' | 'cancel' | 'destructive';

export interface AlertButton {
    text?: string;
    onPress?: (value?: string) => void;
    style?: AlertButtonStyle;
}

export interface AlertOptions {
    cancelable?: boolean;
    onDismiss?: () => void;
}

type AlertKind = 'success' | 'error' | 'warning' | 'info';

interface QueueItem {
    id: number;
    title: string;
    message?: string;
    buttons?: AlertButton[];
    cancelable: boolean;
    onDismiss?: () => void;
    kind: AlertKind;
}

const KIND_STYLE: Record<AlertKind, {core: string; ring: string; symbol: string; symbolColor: string}> = {
    success: {core: '#4caf50', ring: 'rgba(92, 184, 92, 0.35)', symbol: '✓', symbolColor: '#ffffff'},
    error: {core: '#b93f2a', ring: 'rgba(185, 63, 42, 0.3)', symbol: '✕', symbolColor: '#ffffff'},
    warning: {core: '#faa523', ring: 'rgba(250, 165, 35, 0.35)', symbol: '!', symbolColor: '#5d3c00'},
    info: {core: '#337ab7', ring: 'rgba(51, 122, 183, 0.3)', symbol: 'i', symbolColor: '#ffffff'},
};

function detectKind(title: string, message?: string): AlertKind {
    const text = `${title} ${message || ''}`.toLowerCase();
    if (/(erro|falhou|falha|inv[aá]lido|inv[aá]lida|n[aã]o foi poss[ií]vel|negado|proibido|falha ao|erro ao|aten[cç][aã]o)/.test(text)) {
        return /(aten[cç][aã]o|aviso)/.test(text) && !/(erro|falhou|falha|n[aã]o foi poss[ií]vel|inv[aá]lido|inv[aá]lida)/.test(text) ? 'warning' : 'error';
    }
    if (/(sucesso|salvo|atualizado|enviado|removido|exclu[ií]do|criado|registrado|aprovado|gravado)/.test(text)) {
        return 'success';
    }
    if (/(confirmar|deseja|excluir|remover|desativar|reativar|inativar|avis|limpar|reabrir|fechar|aplicar|gerar|tens certeza|continuar|permiss[aã]o|cancel)/.test(text)) {
        return 'warning';
    }
    return 'info';
}

function isSecondary(button: AlertButton): boolean {
    if (button.style === 'cancel') return true;
    return /^(cancelar|cancel|voltar|n[aã]o|fechar|dispensar|ignorar)$/i.test((button.text || '').trim());
}

function isDestructive(button: AlertButton): boolean {
    if (button.style === 'destructive') return true;
    return /^(excluir|remover|desativar|deletar|apagar)$/i.test((button.text || '').trim());
}

// ---------------------------------------------------------------------------
// Registry: lets `Alert.alert` reach the mounted provider.
// ---------------------------------------------------------------------------
type ShowFn = (item: QueueItem) => void;

const listeners = new Set<ShowFn>();
let nextId = 1;

function register(fn: ShowFn): () => void {
    listeners.add(fn);
    return () => {
        listeners.delete(fn);
    };
}

function show(item: QueueItem): void {
    if (listeners.size > 0) {
        listeners.forEach(fn => fn(item));
        return;
    }
    const buttons = item.buttons || [{text: 'OK'}];
    NativeAlert.alert(item.title, item.message, buttons, {
        cancelable: item.cancelable,
        onDismiss: item.onDismiss,
    });
}

export const Alert = {
    alert(title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions): void {
        show({
            id: nextId++,
            title,
            message,
            buttons,
            cancelable: options?.cancelable !== false,
            onDismiss: options?.onDismiss,
            kind: detectKind(title, message),
        });
    },
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
interface AlertCardProps {
    item: QueueItem;
    onPressButton: (button: AlertButton) => void;
}

function AlertCard({item, onPressButton}: AlertCardProps) {
    const scale = useRef(new Animated.Value(0.9)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                friction: 8,
                tension: 50,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    }, [opacity, scale]);

    const kindStyle = KIND_STYLE[item.kind];
    const buttons = item.buttons && item.buttons.length > 0 ? item.buttons : [{text: 'OK'}];

    const renderButton = (button: AlertButton, index: number) => {
        const label = button.text || (isDestructive(button) ? 'Remover' : 'OK');
        const secondary = isSecondary(button);
        const destructive = isDestructive(button);
        const fullWidth = buttons.length === 1;
        const buttonStyle = secondary
            ? styles.buttonSecondary
            : destructive
            ? styles.buttonDestructive
            : styles.buttonPrimary;
        const textStyle = secondary
            ? styles.buttonSecondaryText
            : destructive
            ? styles.buttonText
            : styles.buttonPrimaryText;

        return (
            <Pressable
                key={index}
                onPress={() => onPressButton(button)}
                style={({pressed}) => [
                    styles.button,
                    buttonStyle,
                    fullWidth && styles.buttonFull,
                    buttons.length === 2 && styles.buttonHalf,
                    pressed && styles.buttonPressed,
                ]}
            >
                <Text style={textStyle}>{label}</Text>
            </Pressable>
        );
    };

    return (
        <View style={styles.cardWrap}>
            <Animated.View style={[styles.card, {opacity, transform: [{scale}]}]}>
                <View style={styles.topBar} />
                <View style={styles.iconRow}>
                    <View style={[styles.iconRing, {borderColor: kindStyle.ring}]}>
                        <View style={[styles.iconCore, {backgroundColor: kindStyle.core}]}>
                            <Text style={[styles.iconSymbol, {color: kindStyle.symbolColor}]}>
                                {kindStyle.symbol}
                            </Text>
                        </View>
                    </View>
                </View>
                {!!item.title && <Text style={styles.title}>{item.title}</Text>}
                {!!item.title && <View style={styles.titleLine} />}
                {!!item.message && (
                    <View style={styles.messageWrap}>
                        <Text style={styles.message}>{item.message}</Text>
                    </View>
                )}
                <View style={styles.actions}>
                    {buttons.length === 1 && renderButton(buttons[0], 0)}
                    {buttons.length === 2 && (
                        <View style={styles.actionsRow}>
                            {renderButton(buttons[0], 0)}
                            {renderButton(buttons[1], 1)}
                        </View>
                    )}
                    {buttons.length > 2 && buttons.map((button, index) => renderButton(button, index))}
                </View>
            </Animated.View>
        </View>
    );
}

export function SweetAlertProvider({children}: {children?: React.ReactNode}) {
    const [queue, setQueue] = useState<QueueItem[]>([]);

    const handleClose = useCallback(() => {
        setQueue(prev => {
            const [head, ...rest] = prev;
            if (head && head.onDismiss) head.onDismiss();
            return rest;
        });
    }, []);

    const handlePressButton = useCallback(
        (button: AlertButton) => {
            setQueue(prev => {
                const [head, ...rest] = prev;
                if (button.onPress) button.onPress();
                return rest;
            });
        },
        [],
    );

    useEffect(() => {
        const unregister = register(item => {
            setQueue(prev => [...prev, item]);
        });
        return unregister;
    }, []);

    const item = queue[0];

    return (
        <View style={{flex: 1}}>
            {children}
            <Modal
                visible={!!item}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    if (item && item.cancelable) handleClose();
                }}
            >
                <View style={styles.modalRoot}>
                <Pressable
                    style={styles.backdrop}
                    onPress={() => {
                        if (item && item.cancelable) handleClose();
                    }}
                />
                {item && (
                    <AlertCard
                        item={item}
                        onPressButton={handlePressButton}
                    />
                )}
            </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: Colors.bgOverlay,
    },
    modalRoot: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    cardWrap: {
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: Colors.bgCard,
        borderWidth: 3,
        borderColor: Colors.borderPrimary,
        borderRadius: BorderRadius.xxl,
        overflow: 'hidden',
        ...Shadows.large,
    },
    topBar: {
        height: 7,
        backgroundColor: '#2f333b',
        borderBottomWidth: 2,
        borderBottomColor: Colors.borderPrimary,
    },
    iconRow: {
        alignItems: 'center',
        marginTop: 24,
    },
    iconRing: {
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCore: {
        width: 62,
        height: 62,
        borderRadius: 31,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.35)',
    },
    iconSymbol: {
        fontSize: 34,
        fontWeight: Typography.weights.bold,
        lineHeight: 38,
        textAlign: 'center',
    },
    title: {
        marginTop: 16,
        textAlign: 'center',
        color: Colors.textPrimary,
        fontSize: Typography.sizes.title,
        fontWeight: Typography.weights.bold,
        letterSpacing: 0.5,
        paddingHorizontal: 20,
    },
    titleLine: {
        width: 44,
        height: 3,
        borderRadius: 2,
        backgroundColor: Colors.borderPrimary,
        marginTop: 10,
        marginBottom: 2,
        alignSelf: 'center',
    },
    messageWrap: {
        alignSelf: 'stretch',
        marginTop: 14,
        marginHorizontal: 20,
        backgroundColor: Colors.goldBg,
        borderWidth: 1,
        borderColor: Colors.borderPrimary,
        borderLeftWidth: 4,
        borderRadius: BorderRadius.lg,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    message: {
        textAlign: 'center',
        color: Colors.goldText,
        fontSize: Typography.sizes.lg,
        lineHeight: 22,
        fontWeight: Typography.weights.medium,
    },
    actions: {
        marginTop: 22,
        paddingHorizontal: 20,
        paddingBottom: 22,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    button: {
        borderRadius: BorderRadius.md,
        paddingVertical: 10,
        paddingHorizontal: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    buttonFull: {
        alignSelf: 'stretch',
        minWidth: 140,
    },
    buttonHalf: {
        flex: 1,
    },
    buttonPrimary: {
        backgroundColor: Colors.btnYellow,
        borderColor: Colors.goldDark,
        borderBottomWidth: 3,
    },
    buttonDestructive: {
        backgroundColor: Colors.btnRed,
        borderColor: Colors.btnRedHover,
        borderBottomWidth: 3,
    },
    buttonSecondary: {
        backgroundColor: '#f5c518',
        borderColor: '#d8b53a',
        borderBottomWidth: 3,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.bold,
    },
    buttonPrimaryText: {
        color: '#332b0b',
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.bold,
    },
    buttonSecondaryText: {
        color: '#3a2f00',
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.bold,
    },
    buttonPressed: {
        opacity: 0.8,
    },
});

export default Alert;