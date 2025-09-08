#!/bin/bash

# ===============================================
# Master Build Script - CelConex
# Orquestador principal de builds
# ===============================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Variables globales
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
BUILD_TYPE="production"
PLATFORM="android"
SKIP_CHECKS=false
FORCE_CLEAN=false
AUTO_SUBMIT=false

show_banner() {
    echo -e "${PURPLE}"
    echo "██████╗ ███████╗██╗      ██████╗ ██████╗ ███╗   ██╗███████╗██╗  ██╗"
    echo "██╔══██╗██╔════╝██║     ██╔════╝██╔═══██╗████╗  ██║██╔════╝╚██╗██╔╝"
    echo "██║  ██║█████╗  ██║     ██║     ██║   ██║██╔██╗ ██║█████╗   ╚███╔╝ "
    echo "██║  ██║██╔══╝  ██║     ██║     ██║   ██║██║╚██╗██║██╔══╝   ██╔██╗ "
    echo "██████╔╝███████╗███████╗╚██████╗╚██████╔╝██║ ╚████║███████╗██╔╝ ██╗"
    echo "╚═════╝ ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝"
    echo ""
    echo "🚀 MASTER BUILD SYSTEM v2.0"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${NC}"
}

show_help() {
    echo "Uso: $0 [OPTIONS]"
    echo ""
    echo "Opciones:"
    echo "  -t, --type TYPE        Tipo de build (development|preview|production) [default: production]"
    echo "  -p, --platform PLATFORM Platform (android|ios|all) [default: android]"
    echo "  -s, --skip-checks      Saltar verificaciones pre-build"
    echo "  -c, --clean            Forzar limpieza profunda antes del build"
    echo "  -a, --auto-submit      Subir automáticamente a las tiendas"
    echo "  -q, --quick            Build rápido (skip-checks + no-clean)"
    echo "  -h, --help             Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0                     # Build de producción para Android"
    echo "  $0 -t preview -p all   # Build preview para Android e iOS"
    echo "  $0 -q                  # Build rápido"
    echo "  $0 -c -a              # Build completo con limpieza y submit"
}

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -t|--type)
                BUILD_TYPE="$2"
                shift 2
                ;;
            -p|--platform)
                PLATFORM="$2"
                shift 2
                ;;
            -s|--skip-checks)
                SKIP_CHECKS=true
                shift
                ;;
            -c|--clean)
                FORCE_CLEAN=true
                shift
                ;;
            -a|--auto-submit)
                AUTO_SUBMIT=true
                shift
                ;;
            -q|--quick)
                SKIP_CHECKS=true
                FORCE_CLEAN=false
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Opción desconocida: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
}

validate_arguments() {
    # Validar BUILD_TYPE
    if [[ ! "$BUILD_TYPE" =~ ^(development|preview|production)$ ]]; then
        echo -e "${RED}❌ Tipo de build inválido: $BUILD_TYPE${NC}"
        echo "Tipos válidos: development, preview, production"
        exit 1
    fi
    
    # Validar PLATFORM
    if [[ ! "$PLATFORM" =~ ^(android|ios|all)$ ]]; then
        echo -e "${RED}❌ Plataforma inválida: $PLATFORM${NC}"
        echo "Plataformas válidas: android, ios, all"
        exit 1
    fi
    
    # Validar combinaciones
    if [[ "$AUTO_SUBMIT" == true && "$BUILD_TYPE" != "production" ]]; then
        echo -e "${YELLOW}⚠️  Auto-submit solo disponible para builds de producción${NC}"
        AUTO_SUBMIT=false
    fi
}

show_build_info() {
    echo -e "${CYAN}📋 CONFIGURACIÓN DEL BUILD${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Tipo de build: $BUILD_TYPE"
    echo "Plataforma: $PLATFORM"
    echo "Saltar verificaciones: $SKIP_CHECKS"
    echo "Limpieza forzada: $FORCE_CLEAN"
    echo "Auto-submit: $AUTO_SUBMIT"
    echo ""
}

run_pre_build_checks() {
    if [[ "$SKIP_CHECKS" == true ]]; then
        echo -e "${YELLOW}⏭️  Saltando verificaciones pre-build${NC}"
        return 0
    fi
    
    echo -e "${CYAN}🔍 Ejecutando verificaciones pre-build...${NC}"
    
    if [[ -f "$PROJECT_ROOT/pre-build-check.sh" ]]; then
        chmod +x "$PROJECT_ROOT/pre-build-check.sh"
        "$PROJECT_ROOT/pre-build-check.sh"
    else
        echo -e "${YELLOW}⚠️  Script de verificación no encontrado${NC}"
    fi
}

run_environment_setup() {
    echo -e "${CYAN}⚙️  Configurando entorno...${NC}"
    
    if [[ -f "$PROJECT_ROOT/configurar-build.sh" ]]; then
        chmod +x "$PROJECT_ROOT/configurar-build.sh"
        "$PROJECT_ROOT/configurar-build.sh"
    else
        echo -e "${YELLOW}⚠️  Script de configuración no encontrado${NC}"
    fi
}

run_deep_clean() {
    if [[ "$FORCE_CLEAN" == true ]]; then
        echo -e "${CYAN}🧹 Ejecutando limpieza profunda...${NC}"
        
        if [[ -f "$PROJECT_ROOT/scripts/deep-clean.sh" ]]; then
            chmod +x "$PROJECT_ROOT/scripts/deep-clean.sh"
            "$PROJECT_ROOT/scripts/deep-clean.sh"
        else
            echo -e "${YELLOW}⚠️  Script de limpieza no encontrado, ejecutando limpieza básica${NC}"
            rm -rf node_modules
            rm -rf .expo
            npm cache clean --force
        fi
        
        # Reinstalar dependencias
        echo -e "${CYAN}📦 Reinstalando dependencias...${NC}"
        npm install
    fi
}

build_android() {
    echo -e "${GREEN}🤖 Construyendo para Android...${NC}"
    
    if [[ -f "$PROJECT_ROOT/crear-aab.sh" ]]; then
        chmod +x "$PROJECT_ROOT/crear-aab.sh"
        "$PROJECT_ROOT/crear-aab.sh"
    else
        echo -e "${RED}❌ Script crear-aab.sh no encontrado${NC}"
        exit 1
    fi
}

build_ios() {
    echo -e "${BLUE}🍎 Construyendo para iOS...${NC}"
    
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo -e "${RED}❌ Build de iOS solo disponible en macOS${NC}"
        return 1
    fi
    
    # Verificar que EAS esté disponible
    if ! command -v eas &> /dev/null; then
        echo -e "${RED}❌ EAS CLI no encontrado${NC}"
        exit 1
    fi
    
    echo "Construyendo iOS con EAS..."
    eas build --platform ios --profile "$BUILD_TYPE" --non-interactive
}

submit_to_stores() {
    if [[ "$AUTO_SUBMIT" != true ]]; then
        return 0
    fi
    
    echo -e "${CYAN}🚀 Subiendo a tiendas de aplicaciones...${NC}"
    
    case $PLATFORM in
        android)
            submit_android
            ;;
        ios)
            submit_ios
            ;;
        all)
            submit_android
            submit_ios
            ;;
    esac
}

submit_android() {
    echo -e "${GREEN}📤 Subiendo a Google Play Store...${NC}"
    
    if [[ -f "google-play-service-account.json" ]]; then
        eas submit --platform android --latest
    else
        echo -e "${YELLOW}⚠️  google-play-service-account.json no encontrado${NC}"
        echo "Sube manualmente el AAB a Google Play Console"
    fi
}

submit_ios() {
    echo -e "${BLUE}📤 Subiendo a Apple App Store...${NC}"
    
    eas submit --platform ios --latest
}

create_build_report() {
    local report_file="build-report-$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$report_file" << EOF
CelConex - Build Report
======================
Fecha: $(date)
Tipo de build: $BUILD_TYPE
Plataforma: $PLATFORM
Estado: EXITOSO

Configuración:
- Verificaciones: $([ "$SKIP_CHECKS" == true ] && echo "SALTADAS" || echo "EJECUTADAS")
- Limpieza: $([ "$FORCE_CLEAN" == true ] && echo "FORZADA" || echo "NORMAL")
- Auto-submit: $([ "$AUTO_SUBMIT" == true ] && echo "HABILITADO" || echo "DESHABILITADO")

Archivos generados:
$(ls -la *.aab *.ipa 2>/dev/null || echo "Ningún archivo local (build remoto)")

Duración del build: ${SECONDS}s
EOF
    
    echo -e "${GREEN}📄 Reporte de build creado: $report_file${NC}"
}

cleanup_on_error() {
    echo -e "${RED}❌ Build fallido. Limpiando...${NC}"
    
    # Limpiar archivos temporales
    rm -rf /tmp/celconex-build-*
    
    # Mostrar logs útiles
    echo -e "${YELLOW}💡 Para debug, revisa:${NC}"
    echo "- Logs de Metro: ~/.expo/metro-*"
    echo "- Logs de EAS: ~/.expo/eas-build-*"
    echo "- Archivos de crash en el directorio del proyecto"
    
    exit 1
}

main() {
    # Trap para manejar errores
    trap cleanup_on_error ERR
    
    # Iniciar timer
    SECONDS=0
    
    show_banner
    
    # Parsear argumentos
    parse_arguments "$@"
    validate_arguments
    show_build_info
    
    # Confirmar antes de continuar
    if [[ "$BUILD_TYPE" == "production" ]]; then
        echo -e "${YELLOW}⚠️  Estás a punto de crear un build de PRODUCCIÓN${NC}"
        read -p "¿Continuar? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Build cancelado"
            exit 0
        fi
    fi
    
    echo -e "${CYAN}🚀 Iniciando proceso de build...${NC}"
    echo ""
    
    # Ejecutar pasos del build
    run_pre_build_checks
    run_environment_setup
    run_deep_clean
    
    # Construir según la plataforma
    case $PLATFORM in
        android)
            build_android
            ;;
        ios)
            build_ios
            ;;
        all)
            build_android
            build_ios
            ;;
    esac
    
    # Submit si está habilitado
    submit_to_stores
    
    # Crear reporte
    create_build_report
    
    # Mensaje final
    echo ""
    echo -e "${GREEN}🎉 ¡BUILD COMPLETADO EXITOSAMENTE!${NC}"
    echo -e "${CYAN}⏱️  Duración total: ${SECONDS}s${NC}"
    
    if [[ "$BUILD_TYPE" == "production" ]]; then
        echo ""
        echo -e "${PURPLE}🚀 Tu aplicación está lista para publicar!${NC}"
        echo "Próximos pasos:"
        echo "1. 🧪 Prueba la aplicación en dispositivos reales"
        echo "2. 📝 Actualiza la descripción en las tiendas"
        echo "3. 📸 Actualiza screenshots y assets"
        echo "4. 🚀 Publica cuando estés listo"
    fi
}

# Ejecutar script principal
main "$@"