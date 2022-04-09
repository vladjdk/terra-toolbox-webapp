import { Container, Paper, Grid } from '@mui/material';
import useNetwork from 'hooks/useNetwork';
import { useNebula, ClusterList, ClusterState } from 'hooks/useNebula';
import { useEffect, useState } from 'react';
import { useConnectedWallet, useLCDClient } from '@terra-money/wallet-provider';

export function FreeWilly() {
    const network = useNetwork();
    const wallet = useConnectedWallet();
    const lcd = useLCDClient();
    const { getClusterList, getClusterState, getClusterInfo, getTarget } = useNebula(network.contracts.nebulaFactory);

    const [clusterAddresses, setClusterAddresses] = useState<string[]>([]);
    const [selectedCluster, setSelectedCluster] = useState<string>();
    const [clusterState, setClusterState] = useState<ClusterState>();
    
    useEffect(() => {
        getAllClusters().then()
    }, [wallet, network])

    useEffect(() => {
        if(selectedCluster) {
            getInfoForCluster(selectedCluster).then()
        }
    }), [selectedCluster]

    const getAllClusters = async () => {
        getClusterList().then(data => {
            const clusterAddresses: string[] = [];
            data.contract_infos.forEach(contract => {
                if(contract.active) {
                    clusterAddresses.push(contract.contract_addr);
                }
            });
            setClusterAddresses(clusterAddresses);
            setSelectedCluster(clusterAddresses[0])
        })
    }

    const getInfoForCluster = async (clusterAddress: string) => {
        getClusterState(clusterAddress).then(data => {
            setClusterState(data);
        })
    }

    const onRefresh = () => {
        
    }

    return (
        <Container sx={{maxWidth: '1200px', padding: '10px'}}>

        </Container>
    );
  }
